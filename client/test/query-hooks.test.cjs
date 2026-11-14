const { test, beforeEach, afterEach, after } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const { JSDOM } = require("jsdom");

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost:3000",
});
global.window = dom.window;
global.self = dom.window;
global.document = dom.window.document;
// Radix dialogs use these browser APIs for presence, focus and dismissal.
for (const name of [
  "getComputedStyle",
  "MutationObserver",
  "NodeFilter",
  "HTMLElement",
  "HTMLInputElement",
  "CustomEvent",
  "Node",
])
  global[name] = dom.window[name];
global.localStorage = dom.window.localStorage;
Object.defineProperty(global, "navigator", {
  configurable: true,
  value: dom.window.navigator,
});
global.IS_REACT_ACT_ENVIRONMENT = true;

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...args) {
  return originalResolve.call(
    this,
    name.startsWith("@/") ? resolve(__dirname, "../src", name.slice(2)) : name,
    ...args,
  );
};
require.extensions[".ts"] = (module, filename) => {
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: filename,
  });
  module._compile(outputText, filename);
};
require.extensions[".tsx"] = require.extensions[".ts"];

const React = require("react");
const {
  renderHook,
  render: renderComponent,
  fireEvent,
  act,
  waitFor,
  cleanup,
} = require("@testing-library/react");
const {
  QueryClientProvider,
  onlineManager,
  focusManager,
} = require("@tanstack/react-query");
const axios = require("axios");
let handleRequest;
// Exercise the real HTTP services without a network or real account.
axios.defaults.adapter = (config) => handleRequest(config);
const { createQueryClient } = require("../src/lib/query-client.ts");
const { getUser, loginUser } = require("../src/config/axios.ts");
const { useProfile, profileKey } = require("../src/hooks/useProfile.ts");
const {
  useLogin,
  useSignup,
  useForgotPassword,
  useResetPassword,
} = require("../src/hooks/useAuth.ts");
const { useLogout } = require("../src/hooks/useLogout.ts");
const { useUpdateLocation } = require("../src/hooks/useUpdateLocation.ts");
const { useCurrentLocation } = require("../src/hooks/useCurrentLocation.ts");
const { usePinAddress } = require("../src/hooks/usePinAddress.ts");
const AddressReview =
  require("../src/components/location/AddressReview.tsx").default;
const saved = {
  userId: "customer-one",
  email: "one@example.com",
  username: "One",
  role: "user",
  roles: ["user"],
  location: { country: "Nigeria", state: "Lagos", city: "Ikeja" },
};
const updated = {
  ...saved,
  location: {
    country: "Nigeria",
    state: "Edo",
    city: "Benin City",
    lga: "Oredo",
  },
};
const session = { ...saved, accessToken: "test-access-token" };
after(() => dom.window.close());

let client;
let requests;
function response(config, data, status = 200) {
  return { config, data, status, statusText: "OK", headers: {} };
}
function rejectRequest(config, status) {
  return Promise.reject(
    new axios.AxiosError(
      "Request failed",
      "ERR_BAD_RESPONSE",
      config,
      undefined,
      response(config, { message: "Please try again" }, status),
    ),
  );
}
function wrapper({ children }) {
  return React.createElement(QueryClientProvider, { client }, children);
}
function render(hook) {
  return renderHook(hook, { wrapper });
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
beforeEach(() => {
  client = createQueryClient();
  client.setDefaultOptions({
    ...client.getDefaultOptions(),
    queries: {
      ...client.getDefaultOptions().queries,
      retryDelay: 0,
      gcTime: Infinity,
    },
  });
  requests = [];
  handleRequest = async (config) => {
    requests.push(config);
    throw new Error(`Unexpected request: ${config.url}`);
  };
  localStorage.clear();
  loginUser(session);
});
afterEach(async () => {
  cleanup();
  await client.cancelQueries();
  client.clear();
  onlineManager.setOnline(true);
  focusManager.setFocused(undefined);
});

test("profile consumers share one request and cache without caching the access token", async () => {
  const pending = deferred();
  handleRequest = (config) => {
    requests.push(config);
    return pending.promise;
  };
  const first = render(useProfile);
  const second = render(useProfile);
  assert.equal(first.result.current.data.location.city, "Ikeja");
  await waitFor(() => assert.equal(requests.length, 1));
  assert.ok(requests[0].signal);
  assert.equal(
    requests[0].headers.Authorization,
    `Bearer ${session.accessToken}`,
  );
  await act(async () =>
    pending.resolve(response(requests[0], { data: updated })),
  );
  await waitFor(() =>
    assert.equal(second.result.current.data.location.city, "Benin City"),
  );
  assert.equal(first.result.current.data, second.result.current.data);
  assert.equal(getUser().location.city, "Benin City");
  assert.equal(
    client.getQueryData(profileKey(saved.userId)).accessToken,
    undefined,
  );
  first.unmount();
  second.unmount();
  render(useProfile);
  assert.equal(
    requests.length,
    1,
    "fresh cached data does not refetch on navigation",
  );
});

test("failed profile refresh preserves saved details and does not retry client errors", async () => {
  handleRequest = (config) => {
    requests.push(config);
    return rejectRequest(config, 403);
  };
  const profile = render(useProfile);
  await waitFor(() => assert.equal(profile.result.current.isError, true));
  assert.equal(profile.result.current.data.location.city, "Ikeja");
  assert.equal(requests.length, 1);
});

test("location saving cancels an old read, updates every consumer, and refetches the profile", async () => {
  const oldRead = deferred();
  const freshRead = deferred();
  let reads = 0;
  handleRequest = (config) => {
    requests.push(config);
    if (config.method === "patch")
      return Promise.resolve(response(config, { data: updated }));
    reads++;
    return reads === 1 ? oldRead.promise : freshRead.promise;
  };
  const profile = render(useProfile);
  const other = render(useProfile);
  const mutation = render(useUpdateLocation);
  await waitFor(() => assert.equal(reads, 1));
  let done;
  act(() => {
    done = mutation.result.current.mutateAsync(updated.location);
  });
  await waitFor(() => assert.equal(reads, 2));
  assert.equal(requests[0].signal.aborted, true);
  assert.equal(profile.result.current.data.location.city, "Benin City");
  assert.equal(other.result.current.data.location.city, "Benin City");
  assert.equal(getUser().location.city, "Benin City");
  assert.equal(mutation.result.current.isPending, true);
  await act(async () => {
    oldRead.resolve(response(requests[0], { data: saved }));
    freshRead.resolve(response(requests.at(-1), { data: updated }));
    await done;
  });
  await waitFor(() => assert.equal(mutation.result.current.isSuccess, true));
  assert.equal(profile.result.current.data.location.city, "Benin City");
  assert.equal(getUser().location.city, "Benin City");
});

test("failed location saves leave the cached and stored profile unchanged", async () => {
  client.setQueryData(profileKey(saved.userId), saved);
  handleRequest = (config) => {
    requests.push(config);
    return rejectRequest(config, 500);
  };
  const mutation = render(useUpdateLocation);
  await act(async () => {
    await assert.rejects(mutation.result.current.mutateAsync(updated.location));
  });
  assert.equal(client.getQueryData(profileKey(saved.userId)), saved);
  assert.equal(getUser().location.city, "Ikeja");
  assert.equal(requests.length, 1);
});

test("logout failure keeps the session; success cancels pending reads and clears private caches", async () => {
  const pending = deferred();
  handleRequest = (config) =>
    config.method === "get" ? pending.promise : rejectRequest(config, 500);
  const profile = render(useProfile);
  const logout = render(useLogout);
  await waitFor(() => assert.equal(profile.result.current.isFetching, true));
  const query = client
    .getQueryCache()
    .find({ queryKey: profileKey(saved.userId) });
  await act(async () => {
    await assert.rejects(logout.result.current.mutateAsync());
  });
  assert.equal(getUser().userId, saved.userId);
  assert.equal(
    client.getQueryData(profileKey(saved.userId)).email,
    saved.email,
  );
  handleRequest = (config) =>
    Promise.resolve(response(config, { success: true }));
  await act(async () => {
    await logout.result.current.mutateAsync();
  });
  assert.equal(getUser(), null);
  assert.equal(query.state.fetchStatus, "idle");
  assert.equal(client.getQueryData(profileKey(saved.userId)), undefined);
  await act(async () => pending.resolve(response({}, { data: updated })));
  assert.equal(
    getUser(),
    null,
    "a late response cannot restore a logged-out session",
  );
  assert.equal(client.getQueryData(profileKey(saved.userId)), undefined);
});

test("sign-in clears the previous user's cache and seeds only the new public profile", async () => {
  client.setQueryData(profileKey(saved.userId), saved);
  const next = {
    ...session,
    userId: "customer-two",
    email: "two@example.com",
    accessToken: "new-token",
  };
  handleRequest = async (config) => {
    requests.push(config);
    return response(config, { data: next });
  };
  const login = render(useLogin);
  await act(async () => {
    await login.result.current.mutateAsync({
      email: next.email,
      password: "test-password",
    });
  });
  assert.equal(getUser().userId, next.userId);
  assert.equal(client.getQueryData(profileKey(saved.userId)), undefined);
  assert.equal(client.getQueryData(profileKey(next.userId)).email, next.email);
  assert.equal(
    client.getQueryData(profileKey(next.userId)).accessToken,
    undefined,
  );
  assert.equal(
    login.result.current.data,
    undefined,
    "access tokens are not mutation results",
  );
  login.unmount();
  await waitFor(() =>
    assert.equal(client.getMutationCache().getAll().length, 0),
  );
});

test("auth mutations fail immediately offline and invalid credentials never trigger token refresh", async () => {
  onlineManager.setOnline(false);
  handleRequest = (config) => {
    requests.push(config);
    return rejectRequest(config, 401);
  };
  const login = render(useLogin);
  await act(async () => {
    await assert.rejects(
      login.result.current.mutateAsync({
        email: "one@example.com",
        password: "wrong-password",
      }),
    );
  });
  await waitFor(() => assert.equal(login.result.current.isError, true));
  assert.equal(login.result.current.isPaused, false);
  assert.deepEqual(
    requests.map((config) => config.url),
    ["/auth/login"],
  );
  assert.equal(getUser().accessToken, session.accessToken);
});

test("signup, recovery and reset hooks preserve payload contracts and reset clears session data", async () => {
  handleRequest = async (config) => {
    requests.push(config);
    return response(config, { success: true });
  };
  const signup = render(useSignup);
  await act(async () => {
    await signup.result.current.mutateAsync({
      username: "Foodie",
      email: "new@example.com",
      phoneNumber: "08012345678",
      password: "secret-password",
      confirmPassword: "secret-password",
      country: "Nigeria",
      state: "Edo",
      city: "Benin City",
      lga: "Oredo",
      area: "GRA",
    });
  });
  const payload = JSON.parse(requests[0].data);
  assert.equal(payload.phoneNumber, "+2348012345678");
  assert.equal(payload.location, undefined);
  assert.equal(payload.role, "user");
  assert.equal(payload.confirmPassword, undefined);
  const recovery = render(useForgotPassword);
  await act(async () => {
    await recovery.result.current.mutateAsync("new@example.com");
  });
  assert.deepEqual(JSON.parse(requests[1].data), { email: "new@example.com" });
  client.setQueryData(profileKey(saved.userId), saved);
  const reset = render(useResetPassword);
  const resetData = {
    token: "a".repeat(64),
    password: "new-password",
    confirmPassword: "new-password",
  };
  await act(async () => {
    await reset.result.current.mutateAsync(resetData);
  });
  assert.deepEqual(JSON.parse(requests[2].data), resetData);
  assert.equal(getUser(), null);
  assert.equal(client.getQueryData(profileKey(saved.userId)), undefined);
});

test("device location is click-triggered, is not retried, and makes no request on denied permission", async (t) => {
  let gpsCalls = 0;
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition: (_success, failure) => {
        gpsCalls++;
        failure({ code: 1 });
      },
    },
  });
  const fetchMock = t.mock.method(global, "fetch", async () => {
    throw new Error("Unexpected network");
  });
  const location = render(useCurrentLocation);
  await act(async () => {
    focusManager.setFocused(true);
    onlineManager.setOnline(false);
    onlineManager.setOnline(true);
  });
  assert.equal(gpsCalls, 0);
  await act(async () => {
    await assert.rejects(
      location.result.current.mutateAsync(),
      /permission wasn’t granted/,
    );
  });
  assert.equal(gpsCalls, 1);
  assert.equal(fetchMock.mock.callCount(), 0);
});

test("device lookup fills canonical fields and aborts when its component unmounts", async (t) => {
  const coords = { latitude: 6.34, longitude: 5.62, accuracy: 20 };
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition: (success) => success({ coords }),
    },
  });
  let signal;
  handleRequest = async (config) => {
    signal = config.signal;
    assert.equal(config.url, "/locations/reverse");
    assert.deepEqual(JSON.parse(config.data), {
      latitude: 6.34,
      longitude: 5.62,
    });
    return response(config, {
      data: {
        address: {
          city: "Benin City",
          state: "Edo",
          point: { type: "Point", coordinates: [5.63, 6.35] },
          precision: "street",
        },
        attribution: { text: "Geoapify", url: "https://www.geoapify.com/" },
      },
    });
  };
  const location = render(useCurrentLocation);
  let detected;
  await act(async () => {
    detected = await location.result.current.mutateAsync();
  });
  assert.equal(detected.location.city, "Benin City");
  assert.deepEqual(detected.location.point.coordinates, [5.63, 6.35]);
  assert.deepEqual(detected.position.point.coordinates, [5.62, 6.34]);
  location.unmount();
  assert.equal(signal.aborted, true);
  await waitFor(() =>
    assert.equal(client.getMutationCache().getAll().length, 0),
  );
});

test("a late browser position after unmount never starts the external lookup", async (t) => {
  let deliverPosition;
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition: (success) => {
        deliverPosition = success;
      },
    },
  });
  const fetchMock = t.mock.method(global, "fetch", async () => {
    throw new Error("Unexpected network");
  });
  const location = render(useCurrentLocation);
  let done;
  act(() => {
    done = location.result.current.mutateAsync().catch((error) => error);
  });
  await waitFor(() => assert.equal(typeof deliverPosition, "function"));
  location.unmount();
  await act(async () => {
    deliverPosition({
      coords: { latitude: 6.34, longitude: 5.62, accuracy: 20 },
    });
    await done;
  });
  assert.equal(fetchMock.mock.callCount(), 0);
});

test("confirmed address saving explicitly sends confirmation and updates the profile cache", async () => {
  handleRequest = async (config) => {
    requests.push(config);
    assert.equal(JSON.parse(config.data).confirmed, true);
    return response(config, { data: updated });
  };
  const mutation = render(() => useUpdateLocation({ confirmed: true }));
  await act(async () => {
    await mutation.result.current.mutateAsync(updated.location);
  });
  assert.equal(
    client.getQueryData(profileKey(saved.userId)).location.city,
    "Benin City",
  );
});

test("invalid device positions never call the backend", async () => {
  const {
    lookupDeviceLocation,
  } = require("../src/sevices/location.service.ts");
  handleRequest = async (config) => {
    requests.push(config);
    throw new Error("Unexpected request");
  };
  for (const coords of [
    { latitude: 91, longitude: 5, accuracy: 20 },
    { latitude: 6, longitude: 181, accuracy: 20 },
    { latitude: 6, longitude: 5, accuracy: 6000 },
  ])
    await assert.rejects(
      lookupDeviceLocation({ coords }, new AbortController().signal),
      /too approximate/,
    );
  assert.equal(requests.length, 0);
});

test("address search is debounced and never refetches on focus or reconnect", async () => {
  const { useAddressSearch } = require("../src/hooks/useAddressSearch.ts");
  handleRequest = async (config) => {
    requests.push(config);
    return response(config, {
      data: {
        suggestions: [{ formattedAddress: "Test street" }],
        attribution: { text: "Geoapify" },
      },
    });
  };
  const query = renderHook(({ text }) => useAddressSearch(text), {
    initialProps: { text: "Ma" },
    wrapper: ({ children }) =>
      React.createElement(QueryClientProvider, { client }, children),
  });
  assert.equal(requests.length, 0);
  query.rerender({ text: "Mar" });
  query.rerender({ text: "Marina, Lagos" });
  await waitFor(() =>
    assert.equal(query.result.current.data?.suggestions.length, 1),
  );
  assert.equal(requests.length, 1);
  assert.deepEqual(JSON.parse(requests[0].data), { text: "Marina, Lagos" });
  await act(async () => {
    focusManager.setFocused(false);
    focusManager.setFocused(true);
    onlineManager.setOnline(false);
    onlineManager.setOnline(true);
  });
  assert.equal(requests.length, 1);
  query.rerender({ text: "New search" });
  assert.equal(
    query.result.current.data,
    undefined,
    "old suggestions disappear immediately",
  );
  query.unmount();
});

test("cancelling a pending device lookup ignores a late permission result", async () => {
  let deliverPosition;
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition: (success) => {
        deliverPosition = success;
      },
    },
  });
  const location = render(useCurrentLocation);
  let done;
  act(() => {
    done = location.result.current.mutateAsync().catch((error) => error);
  });
  await waitFor(() => assert.equal(typeof deliverPosition, "function"));
  await act(async () => {
    location.result.current.cancel();
    deliverPosition({
      coords: { latitude: 6.34, longitude: 5.62, accuracy: 20 },
    });
    await done;
  });
  assert.equal(requests.length, 0);
  await waitFor(() => assert.equal(location.result.current.isPending, false));
});

test("pin lookup uses the chosen coordinates and ignores a late response from a previous pin", async () => {
  const first = deferred();
  const second = deferred();
  handleRequest = (config) => {
    requests.push(config);
    return requests.length === 1 ? first.promise : second.promise;
  };
  const { result } = render(usePinAddress);
  assert.equal(requests.length, 0);
  let applied;
  act(() =>
    result.current.mutate(
      { type: "Point", coordinates: [5.62, 6.34] },
      {
        onSuccess: (address) => {
          applied = address;
        },
      },
    ),
  );
  await waitFor(() => assert.equal(requests.length, 1));
  assert.deepEqual(JSON.parse(requests[0].data), {
    latitude: 6.34,
    longitude: 5.62,
  });
  act(() => result.current.cancel());
  assert.equal(requests[0].signal.aborted, true);
  act(() =>
    result.current.mutate(
      { type: "Point", coordinates: [3.39, 6.44] },
      {
        onSuccess: (address) => {
          applied = address;
        },
      },
    ),
  );
  await waitFor(() => assert.equal(requests.length, 2));
  await act(async () =>
    second.resolve(
      response(requests[1], { data: { address: { street: "New street" } } }),
    ),
  );
  await waitFor(() => assert.equal(applied.street, "New street"));
  await act(async () =>
    first.resolve(
      response(requests[0], { data: { address: { street: "Old street" } } }),
    ),
  );
  assert.equal(applied.street, "New street");
  assert.equal(requests.length, 2);
});

test("a failed pin lookup is not retried automatically", async () => {
  handleRequest = (config) => {
    requests.push(config);
    return rejectRequest(config, 503);
  };
  const { result } = render(usePinAddress);
  act(() =>
    result.current.mutate({ type: "Point", coordinates: [5.62, 6.34] }),
  );
  await waitFor(() => assert.equal(result.current.isError, true));
  assert.equal(requests.length, 1);
});

test("a resolved pin replaces stale address fields, preserves apartment details and blocks saving during lookup", async () => {
  const draft = {
    country: "Nigeria",
    state: "Lagos",
    city: "Ikeja",
    lga: "Ikeja",
    area: "Old area",
    street1: "12 Old Street",
    street2: "",
    zip: "100001",
    point: { type: "Point", coordinates: [3.39, 6.44] },
    pointSource: "search",
  };
  const props = {
    draft,
    addressUpdate: null,
    lookingUp: false,
    pinEditing: false,
    pending: false,
    error: "",
    onSubmit: () => {},
    onDifferentAddress: () => {},
    onRegionChange: () => {},
  };
  const view = renderComponent(React.createElement(AddressReview, props));
  fireEvent.click(
    view.getByRole("button", { name: /Apartment, neighbourhood/ }),
  );
  fireEvent.change(view.getByLabelText("Apartment / extra address details"), {
    target: { value: "Flat 2, upstairs" },
  });
  view.rerender(
    React.createElement(AddressReview, { ...props, lookingUp: true }),
  );
  assert.equal(
    view.getByRole("button", { name: "Confirm this address" }).disabled,
    true,
  );
  assert.equal(
    view.getByLabelText("House number & street").closest("fieldset").disabled,
    true,
  );
  const next = {
    ...draft,
    state: "Edo",
    city: "Benin City",
    street1: "Airport Road",
    area: "",
    lga: "",
    zip: "",
    pointSource: "pin",
  };
  view.rerender(
    React.createElement(AddressReview, {
      ...props,
      draft: next,
      addressUpdate: next,
    }),
  );
  await waitFor(() =>
    assert.equal(
      view.getByLabelText("House number & street").value,
      "Airport Road",
    ),
  );
  assert.equal(view.getByLabelText("City or town").value, "Benin City");
  assert.equal(view.getByLabelText("State / FCT").value, "Edo");
  assert.equal(view.getByLabelText("Local government area").value, "");
  assert.equal(view.getByLabelText("Postcode").value, "");
  assert.equal(
    view.getByLabelText("Apartment / extra address details").value,
    "Flat 2, upstairs",
  );
  assert.equal(
    view.getByRole("button", { name: "Confirm this address" }).disabled,
    false,
  );
});

test("map tiles recover once from a transient failure and release their image URL", async (t) => {
  const { createAddressTiles } = require("../src/lib/address-map-tiles.ts");
  const L = require("leaflet");
  const revoked = [];
  t.mock.method(URL, "createObjectURL", () => "blob:test-map-tile");
  t.mock.method(URL, "revokeObjectURL", (url) => revoked.push(url));
  handleRequest = (config) => {
    requests.push(config);
    return requests.length === 1
      ? rejectRequest(config, 503)
      : Promise.resolve(response(config, new Blob(["synthetic-image"])));
  };
  const layer = createAddressTiles(L);
  let loaded = false;
  const tile = layer.createTile({ z: 17, x: 1, y: 1 }, (error) => {
    assert.equal(error, undefined);
    loaded = true;
  });
  await waitFor(() => assert.equal(tile.src, "blob:test-map-tile"));
  assert.equal(requests.length, 2);
  tile.onload();
  assert.equal(loaded, true);
  assert.deepEqual(revoked, ["blob:test-map-tile"]);
  layer.fire("tileunload", { tile });
});

test("map tiles do not retry rate limits, and unloading aborts an unfinished request", async () => {
  const { createAddressTiles } = require("../src/lib/address-map-tiles.ts");
  const L = require("leaflet");
  handleRequest = (config) => {
    requests.push(config);
    return rejectRequest(config, 429);
  };
  const layer = createAddressTiles(L);
  let failure;
  layer.createTile({ z: 17, x: 2, y: 2 }, (error) => {
    failure = error;
  });
  await waitFor(() => assert.ok(failure));
  assert.equal(requests.length, 1);
  const pending = deferred();
  handleRequest = (config) => {
    requests.push(config);
    return pending.promise;
  };
  let completed = false;
  const tile = layer.createTile({ z: 17, x: 3, y: 3 }, () => {
    completed = true;
  });
  await waitFor(() => assert.equal(requests.length, 2));
  layer.fire("tileunload", { tile });
  assert.equal(requests[1].signal.aborted, true);
  await act(async () =>
    pending.resolve(response(requests[1], new Blob(["synthetic-image"]))),
  );
  assert.equal(completed, false);
});

test("the phone picker defaults to Nigeria, supports national-number paste and switches countries", async () => {
  const PhoneField = require("../src/components/shared/PhoneField.tsx").default;
  let value;
  function Form() {
    const [phone, setPhone] = React.useState("");
    return React.createElement(PhoneField, {
      id: "test-phone",
      name: "phoneNumber",
      value: phone,
      onChange: (next) => {
        value = next;
        setPhone(next);
      },
      onBlur: () => {},
    });
  }
  const view = renderComponent(React.createElement(Form));
  const input = view.getByLabelText("Phone number");
  assert.equal(input.type, "tel");
  assert.equal(input.autocomplete, "tel");
  assert.equal(input.value.replace(/\D/g, ""), "234");
  fireEvent.change(input, { target: { value: "+234 0" } });
  assert.equal(input.value.replace(/\D/g, ""), "234");
  fireEvent.paste(input, { clipboardData: { getData: () => "0801 234 5678" } });
  await waitFor(() => assert.equal(value, "+2348012345678"));
  assert.equal(input.value.replace(/\D/g, ""), "2348012345678");
  fireEvent.paste(input, {
    clipboardData: { getData: () => "+44 20 7946 0018" },
  });
  fireEvent.paste(input, { clipboardData: { getData: () => "020 7946 0018" } });
  assert.equal(value, "+442079460018");
  fireEvent.paste(input, {
    clipboardData: { getData: () => "+2348012345678" },
  });
  fireEvent.click(view.getByRole("button", { name: /Nigeria/ }));
  fireEvent.change(view.getByPlaceholderText("Search country"), {
    target: { value: "United Kingdom" },
  });
  fireEvent.click(view.getByRole("option", { name: /United Kingdom/ }));
  fireEvent.paste(input, { clipboardData: { getData: () => "020 7946 0018" } });
  await waitFor(() => assert.equal(value, "+442079460018"));
  assert.equal(input.value.replace(/\D/g, ""), "442079460018");
});

test("the controlled phone field reports validation errors and receives form focus", async () => {
  const PhoneField = require("../src/components/shared/PhoneField.tsx").default;
  const { useForm, Controller } = require("react-hook-form");
  const { zodResolver } = require("@hookform/resolvers/zod");
  const { signupSchema } = require("../src/lib/auth-validation.ts");
  let submitted;
  function Form() {
    const {
      control,
      handleSubmit,
      formState: { errors },
    } = useForm({
      resolver: zodResolver(signupSchema),
      defaultValues: {
        username: "Test user",
        email: "test@example.com",
        password: "test-password",
        confirmPassword: "test-password",
        phoneNumber: "",
      },
    });
    return React.createElement(
      "form",
      {
        noValidate: true,
        onSubmit: handleSubmit((data) => {
          submitted = data;
        }),
      },
      React.createElement(Controller, {
        name: "phoneNumber",
        control,
        render: ({ field }) =>
          React.createElement(PhoneField, {
            id: "test-phone",
            name: field.name,
            value: field.value,
            onChange: field.onChange,
            onBlur: field.onBlur,
            inputRef: field.ref,
            error: errors.phoneNumber?.message,
          }),
      }),
      React.createElement("button", { type: "submit" }, "Continue"),
    );
  }
  const view = renderComponent(React.createElement(Form));
  fireEvent.click(view.getByRole("button", { name: "Continue" }));
  await waitFor(() =>
    assert.match(view.getByRole("alert").textContent, /valid phone number/),
  );
  const input = view.getByLabelText("Phone number");
  assert.equal(document.activeElement, input);
  assert.equal(input.getAttribute("aria-invalid"), "true");
  assert.equal(submitted, undefined);
  fireEvent.paste(input, {
    clipboardData: { getData: () => "+2348012345678" },
  });
  fireEvent.click(view.getByRole("button", { name: "Continue" }));
  await waitFor(() => assert.equal(submitted.phoneNumber, "+2348012345678"));
});

const {
  useDiscovery,
  useKitchenMenu,
  discoveryKey,
} = require("../src/hooks/useDiscovery.ts");
test("discovery consumers share requests and keep each destination in its own cache", async () => {
  client.setQueryData(profileKey(saved.userId), saved);
  handleRequest = async (config) => {
    requests.push(config);
    assert.equal(config.url, "/discovery/kitchens");
    return response(config, {
      data: {
        mode: "city",
        items: [{ vendorId: "old-city" }],
        page: 1,
        limit: 12,
        hasMore: false,
      },
    });
  };
  const filters = { q: "", category: "", openOnly: false };
  const first = render(() => useDiscovery(filters));
  const second = render(() => useDiscovery(filters));
  await waitFor(() => assert.equal(first.result.current.isSuccess, true));
  assert.equal(requests.length, 1);
  assert.equal(
    second.result.current.data.pages[0].items[0].vendorId,
    "old-city",
  );
  const pending = deferred();
  handleRequest = (config) => {
    requests.push(config);
    return pending.promise;
  };
  act(() => client.setQueryData(profileKey(saved.userId), updated));
  await waitFor(() => assert.equal(requests.length, 2));
  assert.equal(
    first.result.current.data,
    undefined,
    "old-address kitchens are not placeholder data",
  );
  assert.notDeepEqual(discoveryKey(saved), discoveryKey(updated));
  await act(async () =>
    pending.resolve(
      response(requests[1], {
        data: {
          mode: "city",
          items: [{ vendorId: "new-city" }],
          page: 1,
          limit: 12,
          hasMore: false,
        },
      }),
    ),
  );
  await waitFor(() =>
    assert.equal(
      second.result.current.data.pages[0].items[0].vendorId,
      "new-city",
    ),
  );
  assert.equal(
    requests[1].params.cityId,
    undefined,
    "destination is resolved on the server",
  );
  assert.equal(requests[1].params.latitude, undefined);
});

test("discovery pagination preserves filters and menu client errors do not retry", async () => {
  client.setQueryData(profileKey(saved.userId), saved);
  handleRequest = async (config) => {
    requests.push(config);
    if (config.url.includes("/menu")) return rejectRequest(config, 404);
    assert.equal(config.params.category, "rice");
    assert.equal(config.params.q, "jollof");
    assert.equal(config.params.openOnly, true);
    return response(config, {
      data: {
        mode: "city",
        items: [{ vendorId: `kitchen-${config.params.page}` }],
        page: config.params.page,
        limit: 12,
        hasMore: config.params.page === 1,
      },
    });
  };
  const results = render(() =>
    useDiscovery({ q: "jollof", category: "rice", openOnly: true }),
  );
  await waitFor(() => assert.equal(results.result.current.isSuccess, true));
  assert.equal(results.result.current.data.pages.length, 1);
  await act(async () => results.result.current.fetchNextPage());
  await waitFor(() =>
    assert.equal(results.result.current.data.pages.length, 2),
  );
  assert.equal(results.result.current.hasNextPage, false);
  const menu = render(() => useKitchenMenu("missing"));
  await waitFor(() => assert.equal(menu.result.current.isError, true));
  assert.equal(
    requests.filter((config) => config.url.includes("/menu")).length,
    1,
  );
});

test("saving an address cancels old discovery reads and replaces the destination cache", async () => {
  client.setQueryData(profileKey(saved.userId), saved);
  const oldRead = deferred();
  let changed = false;
  handleRequest = async (config) => {
    requests.push(config);
    if (config.method === "patch") {
      changed = true;
      return response(config, { data: updated });
    }
    if (config.url.startsWith("/users/"))
      return response(config, { data: changed ? updated : saved });
    if (!changed) return oldRead.promise;
    return response(config, {
      data: {
        mode: "city",
        items: [{ vendorId: "new-address-kitchen" }],
        page: 1,
        limit: 12,
        hasMore: false,
      },
    });
  };
  const discovery = render(() =>
    useDiscovery({ q: "", category: "", openOnly: false }),
  );
  const update = render(useUpdateLocation);
  await waitFor(() => assert.equal(requests.length, 1));
  const previousRequest = requests[0];
  await act(async () => update.result.current.mutateAsync(updated.location));
  await waitFor(() => assert.equal(discovery.result.current.isSuccess, true));
  assert.equal(previousRequest.signal.aborted, true);
  assert.equal(
    client.getQueriesData({ queryKey: discoveryKey(saved) }).length,
    0,
  );
  assert.equal(
    discovery.result.current.data.pages[0].items[0].vendorId,
    "new-address-kitchen",
  );
  await act(async () =>
    oldRead.resolve(
      response(previousRequest, {
        data: {
          mode: "city",
          items: [{ vendorId: "old-address-kitchen" }],
          page: 1,
          limit: 12,
          hasMore: false,
        },
      }),
    ),
  );
  assert.equal(
    discovery.result.current.data.pages[0].items[0].vendorId,
    "new-address-kitchen",
  );
});

test("menu prices include required paid choices and preserve kobo amounts", () => {
  const {
    minimumMealPrice,
    formatPrice,
  } = require("../src/lib/food-format.ts");
  const item = {
    price: 300050,
    options: [
      {
        minSelections: 2,
        choices: [
          { price: 50000, isAvailable: true },
          { price: 80000, isAvailable: true },
          { price: 10000, isAvailable: false },
        ],
      },
      { minSelections: 0, choices: [{ price: 100000, isAvailable: true }] },
    ],
  };
  assert.equal(minimumMealPrice(item), 430050);
  assert.match(formatPrice(430050), /4,300\.5/);
});

const {
  useDiscoveryFeed,
  useDiscoveryMeals,
} = require("../src/hooks/useDiscovery.ts");
test("kitchen sections preserve branding while loading, but never across saved destinations", async () => {
  client.setQueryData(profileKey(saved.userId), saved);
  const waiting = deferred();
  handleRequest = async (config) => {
    requests.push(config);
    if (config.params.section) return waiting.promise;
    return response(config, {
      data: {
        vendor: { vendorId: "kitchen", businessName: "Test kitchen" },
        sections: [{ id: "section", name: "Meals", count: 1 }],
        items: [{ menuItemId: "a" }],
        page: 1,
        limit: 20,
        hasMore: false,
      },
    });
  };
  const hook = renderHook(({ section }) => useKitchenMenu("kitchen", section), {
    wrapper,
    initialProps: { section: "" },
  });
  await waitFor(() => assert.equal(hook.result.current.isSuccess, true));
  assert.equal(
    hook.result.current.data.pages[0].vendor.businessName,
    "Test kitchen",
  );
  hook.rerender({ section: "section" });
  await waitFor(() =>
    assert.equal(hook.result.current.isPlaceholderData, true),
  );
  assert.equal(
    hook.result.current.data.pages[0].vendor.businessName,
    "Test kitchen",
  );
  act(() => client.setQueryData(profileKey(saved.userId), updated));
  await waitFor(() =>
    assert.equal(hook.result.current.isPlaceholderData, false),
  );
  assert.equal(
    hook.result.current.data,
    undefined,
    "old destination branding and menu are not reused",
  );
});
test("feed reads are shared and meal requests retain the same food and availability filters", async () => {
  client.setQueryData(profileKey(saved.userId), saved);
  handleRequest = async (config) => {
    requests.push(config);
    if (config.url === "/discovery/feed")
      return response(config, {
        data: {
          mode: "city",
          categories: [
            { id: "bakery-snacks", name: "Bakery & snacks", count: 3 },
          ],
          meals: [],
        },
      });
    assert.equal(config.url, "/discovery/meals");
    assert.equal(config.params.category, "bakery-snacks");
    assert.equal(config.params.openOnly, true);
    return response(config, {
      data: { mode: "city", items: [], page: 1, limit: 12, hasMore: false },
    });
  };
  const one = render(() => useDiscoveryFeed());
  const two = render(() => useDiscoveryFeed());
  await waitFor(() => assert.equal(one.result.current.isSuccess, true));
  assert.equal(two.result.current.data.categories[0].id, "bakery-snacks");
  assert.equal(requests.length, 1);
  const meals = render(() =>
    useDiscoveryMeals({
      q: "puff-puff",
      category: "bakery-snacks",
      openOnly: true,
    }),
  );
  await waitFor(() => assert.equal(meals.result.current.isSuccess, true));
  assert.equal(requests.length, 2);
});

test("kitchen hours show overnight service in Nigerian time and clearly label 24-hour opening", () => {
  const {
    kitchenHoursSummary,
    hoursLabel,
  } = require("../src/components/kitchens/KitchenHours.tsx");
  const overnight = [{ day: 5, opensAt: "22:00", closesAt: "02:00" }];
  assert.equal(
    kitchenHoursSummary(overnight, new Date("2026-11-14T00:30:00Z")).label,
    "Open until 2 am",
  );
  assert.equal(
    kitchenHoursSummary(overnight, new Date("2026-11-14T01:00:00Z")).label,
    "Today · Closed",
  );
  assert.equal(
    hoursLabel({ opensAt: "00:00", closesAt: "24:00" }),
    "Open 24 hours",
  );
});

test("kitchen branding falls back cleanly when supplied images fail", () => {
  const {
    KitchenLogo,
    KitchenBanner,
  } = require("../src/components/kitchens/KitchenBranding.tsx");
  const logo = renderComponent(
    React.createElement(KitchenLogo, {
      src: "/missing-logo.png",
      name: "Test Kitchen",
    }),
  );
  fireEvent.error(logo.getByAltText("Test Kitchen logo"));
  assert.equal(logo.getByLabelText("Test Kitchen initials").textContent, "TK");
  logo.unmount();
  const banner = renderComponent(
    React.createElement(KitchenBanner, {
      src: "/missing-banner.png",
      name: "Test Kitchen",
    }),
  );
  fireEvent.error(banner.getByAltText("Test Kitchen cover photo"));
  assert.ok(banner.getByText("Good food lives here."));
});

test("choosing a discovery category closes the picker and restores focus", async () => {
  const Categories =
    require("../src/components/home/CravingCategories.tsx").default;
  let chosen = "";
  const list = [
    { id: "rice", name: "Rice" },
    { id: "bakery-snacks", name: "Bakery & snacks" },
  ];
  const view = renderComponent(
    React.createElement(Categories, {
      selected: "rice",
      categories: list,
      allCategories: list,
      onSelect: (value) => {
        chosen = value;
      },
    }),
  );
  fireEvent.click(view.getByRole("button", { name: "More" }));
  await waitFor(() => assert.ok(view.getByRole("dialog")));
  const { within } = require("@testing-library/react");
  fireEvent.click(
    within(view.getByRole("dialog")).getByRole("button", {
      name: "Bakery & snacks",
    }),
  );
  assert.equal(chosen, "bakery-snacks");
  await waitFor(() => assert.equal(view.queryByRole("dialog"), null));
  assert.equal(
    document.activeElement,
    view.getByRole("button", { name: "More" }),
  );
});

test("the assistant separates taps from drags and stays reachable after resizing", () => {
  const Launcher =
    require("../src/components/app/AssistantLauncher.tsx").default;
  const previousObserver = global.ResizeObserver;
  let onResize;
  global.ResizeObserver = class {
    constructor(callback) {
      onResize = callback;
    }
    observe() {}
    disconnect() {}
  };
  try {
    let opened = 0;
    const view = renderComponent(
      React.createElement(Launcher, { onOpen: () => opened++ }),
    );
    const button = view.getByRole("button", { name: "Ask Amaka" });
    const bounds = button.parentElement;
    let width = 500;
    let height = 400;
    Object.defineProperties(bounds, {
      clientWidth: { get: () => width },
      clientHeight: { get: () => height },
    });
    Object.defineProperties(button, {
      offsetWidth: { value: 150 },
      offsetHeight: { value: 52 },
    });
    bounds.getBoundingClientRect = () => ({ left: 10, top: 10 });
    button.getBoundingClientRect = () => ({
      left:
        10 + (button.style.left ? parseFloat(button.style.left) : width - 150),
      top: 10 + (button.style.top ? parseFloat(button.style.top) : height - 52),
    });
    let captured;
    button.setPointerCapture = (id) => {
      captured = id;
    };
    button.hasPointerCapture = (id) => captured === id;
    button.releasePointerCapture = () => {
      captured = undefined;
    };
    function pointer(kind, x, y) {
      fireEvent(
        button,
        new dom.window.PointerEvent(kind, {
          bubbles: true,
          pointerId: 1,
          isPrimary: true,
          button: 0,
          clientX: x,
          clientY: y,
          pointerType: "touch",
        }),
      );
    }
    pointer("pointerdown", 380, 370);
    pointer("pointermove", 382, 371);
    pointer("pointerup", 382, 371);
    fireEvent.click(button, { detail: 1 });
    assert.equal(opened, 1, "a small finger movement is still a tap");
    pointer("pointerdown", 380, 370);
    pointer("pointermove", -1000, -1000);
    pointer("pointerup", -1000, -1000);
    fireEvent.click(button, { detail: 1 });
    assert.equal(opened, 1, "dragging must not open the chat");
    assert.equal(button.style.left, "0px");
    assert.equal(button.style.top, "0px");
    pointer("pointerdown", 30, 30);
    pointer("pointermove", 10000, 10000);
    pointer("pointerup", 10000, 10000);
    assert.equal(button.style.left, "350px");
    assert.equal(button.style.top, "348px");
    width = 200;
    height = 200;
    act(() => onResize());
    assert.equal(button.style.left, "50px");
    assert.equal(button.style.top, "148px");
    fireEvent.keyDown(button, { key: "ArrowUp" });
    assert.equal(button.style.top, "124px");
    fireEvent.keyDown(button, { key: "Home" });
    assert.equal(button.style.top, "");
    fireEvent.click(button, { detail: 0 });
    assert.equal(opened, 2, "keyboard activation works after a drag");
    pointer("pointerdown", 100, 100);
    pointer("pointercancel", 100, 100);
    pointer("pointermove", 0, 0);
    assert.equal(
      button.style.left,
      "",
      "cancelled gestures stop moving the button",
    );
  } finally {
    global.ResizeObserver = previousObserver;
  }
});

test("mobile search keeps its query and category while showing the correct active tab", async () => {
  const navigationPath = require.resolve("next/navigation");
  const originalNavigation = require(navigationPath);
  require.cache[navigationPath].exports = {
    ...originalNavigation,
    usePathname: () => window.location.pathname,
    useSearchParams: () => new URLSearchParams(window.location.search),
  };
  window.history.replaceState(null, "", "/home?view=search");
  try {
    const Home = require("../src/components/home/HomeDiscovery.tsx").default;
    const Navigation =
      require("../src/components/app/MobileNavigation.tsx").default;
    handleRequest = async (config) => {
      requests.push(config);
      if (config.url === "/users/customer-one")
        return response(config, { data: saved });
      if (config.url === "/food-categories")
        return response(config, { data: [{ id: "rice", name: "Rice" }] });
      if (config.url.startsWith("/discovery/"))
        return response(config, {
          data: {
            mode: "nearby",
            items: [],
            page: 1,
            limit: 12,
            hasMore: false,
          },
        });
      throw new Error(`Unexpected request: ${config.url}`);
    };
    const content = () =>
      React.createElement(
        React.Fragment,
        null,
        React.createElement(Home),
        React.createElement(Navigation),
      );
    const view = renderComponent(content(), { wrapper });
    await waitFor(() => assert.ok(view.getByRole("button", { name: "Rice" })));
    assert.match(
      view.getByText(/Search a dish or kitchen/).textContent,
      /selected address/,
    );
    assert.equal(
      view.getByRole("link", { name: "Search" }).getAttribute("aria-current"),
      "page",
    );
    assert.equal(
      view.getByRole("link", { name: "Discover" }).getAttribute("aria-current"),
      null,
    );
    fireEvent.change(view.getByRole("searchbox"), {
      target: { value: "jollof" },
    });
    view.rerender(content());
    assert.equal(
      new URLSearchParams(window.location.search).get("view"),
      "search",
    );
    assert.equal(view.getByRole("searchbox").value, "jollof");
    await waitFor(() =>
      assert.ok(
        requests.some(
          (r) => r.url === "/discovery/meals" && r.params.q === "jollof",
        ),
      ),
    );
    fireEvent.click(view.getByRole("button", { name: "Rice" }));
    view.rerender(content());
    assert.equal(
      new URLSearchParams(window.location.search).get("category"),
      "rice",
    );
    assert.equal(
      new URLSearchParams(window.location.search).get("view"),
      "search",
    );
    fireEvent.click(view.getByRole("button", { name: "Clear search" }));
    view.rerender(content());
    assert.equal(view.getByRole("searchbox").value, "");
    assert.equal(
      new URLSearchParams(window.location.search).get("category"),
      "rice",
    );
    assert.equal(
      new URLSearchParams(window.location.search).get("view"),
      "search",
    );
    fireEvent.click(view.getByRole("checkbox", { name: "Open now" }));
    view.rerender(content());
    await waitFor(() =>
      assert.ok(
        requests.some(
          (r) => r.url === "/discovery/meals" && r.params.openOnly === true,
        ),
      ),
    );
    assert.equal(
      requests.some((r) => r.url === "/discovery/feed"),
      false,
      "search never displays the unfiltered daily feed",
    );
  } finally {
    require.cache[navigationPath].exports = originalNavigation;
    window.history.replaceState(null, "", "/");
  }
});

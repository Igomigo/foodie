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
global.document = dom.window.document;
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
    },
    fileName: filename,
  });
  module._compile(outputText, filename);
};

const React = require("react");
const { renderHook, act, waitFor, cleanup } = require("@testing-library/react");
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
  assert.equal(payload.location.stateCode, "ED");
  assert.equal(payload.location.lga, "Oredo");
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
  t.mock.method(global, "fetch", async (_url, options) => {
    signal = options.signal;
    return {
      ok: true,
      json: async () => ({
        countryCode: "NG",
        principalSubdivisionCode: "NG-ED",
        principalSubdivision: "Edo State",
        city: "Benin City",
        locality: "GRA",
        lookupSource: "coordinates",
        localityInfo: {
          administrative: [
            { name: "Oredo Local Government Area", adminLevel: 6 },
          ],
        },
      }),
    };
  });
  const location = render(useCurrentLocation);
  let detected;
  await act(async () => {
    detected = await location.result.current.mutateAsync();
  });
  assert.equal(detected.location.city, "Benin City");
  assert.equal(detected.location.lga, "Oredo");
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

import React from "react";
import Image from "next/image";

export default function Avatar() {
  return (
    <div>
      <div>
        <Image src="/images/avatar.png" alt="avatar" width={32} height={32} />
      </div>
    </div>
  );
}

import * as BufferLayout from "buffer-layout";

export namespace Layout {
  /**
   * Layout for a public key
   */
  export const publicKey = (property: string = "publicKey"): any => {
    return BufferLayout.blob(32, property);
  };

  /**
   * Layout for a 64bit unsigned value
   */
  export const u64 = (property: string = "u64"): any => {
    return BufferLayout.blob(8, property);
  };

  /**
   * Layout for a 8bit unsigned value
   */
  export const u8 = (property: string = "u8"): any => {
    return BufferLayout.blob(1, property);
  };

  /**
   * Layout for a Rust String type
   */
  export const rustString = (property: string = "string"): any => {
    const rsl = BufferLayout.struct(
      [
        BufferLayout.u32("length"),
        BufferLayout.u32("lengthPadding"),
        BufferLayout.blob(BufferLayout.offset(BufferLayout.u32(), -8), "chars"),
      ],
      property,
    );
    const _decode = rsl.decode.bind(rsl);
    const _encode = rsl.encode.bind(rsl);

    rsl.decode = (buffer: Buffer, offset: number) => {
      const data = _decode(buffer, offset);
      return data.chars.toString("utf8");
    };

    rsl.encode = (str: string, buffer: Buffer, offset: number) => {
      const data = {
        chars: Buffer.from(str, "utf8"),
      };
      return _encode(data, buffer, offset);
    };

    return rsl;
  };
}

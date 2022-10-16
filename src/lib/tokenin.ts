import CryptoJS from "crypto-js";

export type SigninOptionsType = {
  expiredIn?: number
  chiper?: "AES" | "Rabbit" | "DES" | "TripleDES" | "RC4Drop"
}

export type SigninDataType<T = any> = {
  issuer: string
  expired_in: number
  data: T
}

/**
 * Tokenin - custom library for encrypt and decrypt text like JWT
 */
export const Tokenin = {
  /**
   * Tokenin.sign - function to signin a data
   * @param data - data to be encrypted
   * @param key - encryption key
   * @param options - Tokenin options
   * @example
   * ```ts
   * Tokenin.sign({ message: "Hello World" }, "my-secret-key") => "U2FsdGVkX1+0LA88ojWDF8BOJaj5tFWc0rrchFEEAYO3riQgXyBz8ClkIEaViXPhqYApBgujrYKpicXO7Ml44UM66zWbIJvweT6Ue+Ki7WSKQD413BXRULfPcSws5M2TPCHX7lpmFMKNErmaDQuB0w=="
   * ```
   * @returns string
   */
  sign: (data: any, key?: string, options?: SigninOptionsType): string => {
    const time = new Date();
    const defaultExpiredTime = time.setDate(time.getDate() + 1); // Default: expired in 1 days
    const keys = key || process.env.APP_SECRET_KEY as string || process.env.SESSION_SECRET_KEY as string;
    const signinData: SigninDataType<ReturnType<typeof data>> = {
      issuer: "LimeLight.",
      expired_in: options?.expiredIn ?? defaultExpiredTime,
      data,
    };

    return CryptoJS[options?.chiper ?? "AES"].encrypt(JSON.stringify(signinData), keys).toString();
  },

  /**
   * Tokenin.verify - function to decrypt an data
   * @param signedToken - encrypted token
   * @param key - encryption key
   * @param options - Tokenin options
   * @example
   * ```ts
   * Tokenin.verify("U2FsdGVkX1+0LA88ojWDF8BOJaj5tFWc0rrchFEEAYO3riQgXyBz8ClkIEaViXPhqYApBgujrYKpicXO7Ml44UM66zWbIJvweT6Ue+Ki7WSKQD413BXRULfPcSws5M2TPCHX7lpmFMKNErmaDQuB0w==", "my-secret-key") => { message: "Hello World" }
   * ```
   */
  verify: <T = any>(signedToken: string, key?: string, options?: SigninOptionsType): null | T => {
    const keys = key || process.env.APP_SECRET_KEY as string || process.env.SESSION_SECRET_KEY as string;
    const signedData = CryptoJS[options?.chiper ?? "AES"].decrypt(signedToken, keys).toString(CryptoJS.enc.Utf8) || null;

    if (!signedData) {
      return null;
    }

    const parsedData: SigninDataType<T> = JSON.parse(signedData) || null;

    if (!parsedData || parsedData.expired_in <= Date.now()) {
      return null;
    }

    return parsedData.data as T;
  },
};

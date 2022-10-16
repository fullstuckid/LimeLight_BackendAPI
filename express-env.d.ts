declare global {
  interface SendResponseType<T = null> {
    status?: "success" | "error/failed"
    status_code?: number
    message: string
    data?: T
    length?: number
  }

  namespace Express {
    interface Response {
      /**
       * Send Response Function
       * @description Function to send success response to client
       * @param statusCode - HTTP Status Code (200, 400, 404, 403, 401)
       * @param options - Object containing message, data, statusCode, etc.
       */
      sendResponse: <T = null>(
        statusCode: number,
        options: SendResponseType<T>
      ) => Response

      /**
       * Send Error Response Function
       * @description Function to send error response to client
       * @param statusCode - HTTP Status Code (ex: 200, 400, 404, 403, 401)
       * @param message - Response message
       */
      sendError: (
        statusCode: number,
        message: string
      ) => Response
    }
  }
}

export {};

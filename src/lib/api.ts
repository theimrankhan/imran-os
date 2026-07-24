function delay(ms?: number): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, ms ?? Math.floor(Math.random() * 300) + 200)
  )
}

async function handleResponse<T>(data: T): Promise<T> {
  await delay()
  return data
}

export const api = {
  get: <T>(mockData: T) => handleResponse(mockData),

  post: <T>(_body: unknown, mockData: T) => handleResponse(mockData),

  put: <T>(_body: unknown, mockData: T) => handleResponse(mockData),

  delete: <T>(mockData: T) => handleResponse(mockData),
}
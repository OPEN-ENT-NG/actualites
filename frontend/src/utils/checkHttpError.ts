import { odeServices } from '@edifice.io/client';

function getErrorText() {
  switch (odeServices.http().latestResponse.status) {
    case 401:
      return 'e401.page';
    case 403:
      return 'e403';
    case 404:
      return 'e404.page';
    case 408:
      return 'e408';
    case 500:
      return 'e500';
  }
  return odeServices.http().latestResponse.statusText;
}

export async function checkHttpError<T>(promise: Promise<T>) {
  // odeServices.http() methods return never-failing promises.
  // It is the responsability of the application to check for them.
  try {
    const result = await promise;
    const isResponseHTML =
      (
        odeServices.http().latestResponse.headers?.get('Content-Type') as
          | string
          | undefined
      )?.includes?.('html') ?? false;

    // Check if request was redirected to login page (content is not JSON) or an error occured
    if (!isResponseHTML && !odeServices.http().isResponseError()) return result;
  } catch {}
  // Map well-known status/text to i18n key
  const errorText = odeServices.http().isResponseError()
    ? getErrorText()
    : 'disconnected.warning';

  return Promise.reject<T>(errorText);
}

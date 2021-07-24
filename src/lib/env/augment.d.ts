import IProcessEnv from '#env';

declare global {
  namespace NodeJS {
    interface ProcessEnv extends IProcessEnv {}
  }
}

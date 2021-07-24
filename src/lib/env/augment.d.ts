import IProcessEnv from '#types/IProcessEnv';

declare global {
  namespace NodeJS {
    interface ProcessEnv extends IProcessEnv {}
  }
}

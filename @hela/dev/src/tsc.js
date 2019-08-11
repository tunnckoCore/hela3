import { tscGenTypes } from './support';

export default async function tscWorker(argv) {
  return tscGenTypes(argv);
}

import { createConsumer } from "@rails/actioncable";

let _instance;

export function getConsumer(url) {
  if (!_instance) {
    _instance = createConsumer(url);
  }
  return _instance;
}

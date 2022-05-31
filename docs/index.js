import basicInfo from "./basicInfo.js";
import servers from "./servers.js";
import tags from "./tags.js";
import components from "./components.js";
import user from "./user/index.js";
import rider from "./rider/index.js";

export default {
  ...basicInfo,
  ...servers,
  ...tags,
  ...components,
  ...user,
  ...rider,
};

import Component from "@glimmer/component";
import { service } from "@ember/service";

export default class HomepageNav extends Component {
@service router;

get isOnTopicList() {
const name = this.router?.currentRouteName || "";
return name.startsWith("discovery.");
}
}



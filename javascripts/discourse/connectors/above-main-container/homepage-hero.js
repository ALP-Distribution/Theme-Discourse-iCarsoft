import Component from "@glimmer/component";
import { service } from "@ember/service";

export default class HomepageHero extends Component {
@service router;

get isOnTopicList() {
const name = this.router?.currentRouteName || "";
return name.startsWith("discovery.");
}
}



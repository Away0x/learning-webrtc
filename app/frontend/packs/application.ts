import Rails from "@rails/ujs"
import Turbolinks from "turbolinks"
import * as ActiveStorage from "@rails/activestorage"
import { Application } from 'stimulus';
import { definitionsFromContext } from 'stimulus/webpack-helpers';
import "channels"

import "stylesheets/application"

const application = Application.start();
const controllers = (require as any).context('../controllers', true, /\.ts$/);
application.load(definitionsFromContext(controllers));

Rails.start()
Turbolinks.start()
ActiveStorage.start()

import { createApp } from 'vue';
import App from './App.vue';
import 'bulma/css/bulma.css';
import HbUpload from './components/Upload.vue';
import { Programmatic } from '@oruga-ui/oruga-next/src/utils/config';
const app = createApp(App);
app.component('hbupload', HbUpload);
app.mount('#app');
Programmatic.setOptions({
    iconPack: 'fas',
    iconComponent: 'vue-fontawesome',
    statusIcon: true,
    button: {
        rootClass: 'button',
        outlinedClass: () => {
            return 'is-outlined'; // Outline class does not dependent on variants
        },
        disabledClass: 'btn-disabled',
        variantClass: 'is-'
    },
    field: {
        groupedClass: 'field--grouped',
        rootClass: 'field',
        labelClass: 'label',
        messageClass: 'form-text',
        variantClass: 'field-'
    },
    input: {
        inputClass: 'input',
        variantClass: 'is-',
        iconRightClass: 'input-icon-right'
    },
    icon: {
        variantClass: 'input-icon-'
    },
    dropdown: {
        rootClass: 'dropdown is-active',
        itemClass: 'dropdown-item',
        itemActiveClass: 'is-div-active'
    },
    steps: {
        itemHeaderActiveClass: 'steps-nav-item-active',
        itemHeaderPreviousClass: 'steps-nav-item-previous',
        stepMarkerClass: 'step-marker',
        stepDividerClass: 'step-divider',
    },
    checkbox: {
        override: true,
        rootClass: 'checkbox',
        labelClass: 'checkbox-label',
    },
    upload: {
        override: true,
        rootClass: 'upload',
        draggableClass: 'upload-draggable'
    }
});
//# sourceMappingURL=main.js.map
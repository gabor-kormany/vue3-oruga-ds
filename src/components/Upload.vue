<template>
    <o-upload multiple drag-drop ref="upload" v-model="files">
        {{ state.value }}
     <section class="ex-center">
          <p>Drop your files here or click to upload</p>
        </section>
    </o-upload>

    <div v-for="(file, index) in files" :key="index">
      {{file.name}}
      <o-button icon-left="times" size="small" native-type="button" @click="send('delete', { index })"> </o-button>
    </div>
</template>

<script>
import OUpload from '@oruga-ui/oruga-next/src/components/upload/Upload.vue'
import OButton from '@oruga-ui/oruga-next/src/components/button/Button.vue'
import { useMachine } from '@xstate/vue';
import { createMachine } from 'xstate'
import { computed, onMounted, ref } from '@vue/runtime-core';

const uploadMachine = {
  id: "upload",
  initial: "filesChanged",
  states: {
    default: {
      on: {
        drag: "dropHover",
        hover: "hover",
        click: "selectFileDialog",
        delete: "deletePending"
      },
    },
    hover: {
      on: {
        cancel: "default",
        click: "selectFileDialog",
      },
    },
    dropHover: {
      invoke: {
        src: "checkPayload",
        onDone: { target: "dropAcceptable" },
        onError: { target: "dropNotAcceptable" },
      },
    },
    dropAcceptable: {
      on: {
        drop: "newFilePending",
        cancel: "default",
      },
    },
    dropNotAcceptable: {
      on: {
        cancel: "default",
      },
    },
    newFilePending: {
      invoke: [
        { src: "validateFile", onError: { target: "fileInvalid" } },
        { src: "uploadFile", onError: { target: "uploadError" }, onDone: { target: "filesChanged" } }
      ]
    },
    filesChanged: {
      invoke: {
        src: "canHandleMoreFiles",
        onDone: { target: "default" },
        onError: { target: "uploadLimitReached" },
      }
    },
    fileInvalid: {
      always: "deletePending",
    },
    deletePending: {
      invoke: {
        src: "deleteFile",
        onDone: "filesChanged"
      },
    },
    uploadLimitReached: {
      on: {
        delete: "deletePending",
      },
    },
    uploadError: {
      always: "default",
    },
    selectFileDialog: {
      on: {
        fileChosen: "newFilePending",
        cancel: "default",
      },
    },
  }};

export default {
  components: {
    OUpload, 
    OButton
  },
  props: {
    'modelValue': Object,
    'maxFiles': Number
  },
 setup(props, { emit }) {
    let originalFileChangeHandler
    const files = computed({
      get() {
        return props.modelValue
      },
      set(value) {
        emit(`update:modelValue`, value)
      }
    })
    const { state, send } = useMachine(
        createMachine(
            {...uploadMachine, ...{ context: { files, maxFiles: props.maxFiles } }},
            {
                services: {
                    checkPayload: () => { return Promise.resolve('done') },
                    deleteFile: (context, event) => {
                      context.files.value.splice(event.index, 1)
                      emit(`update:modelValue`, context.files.value)
                      return Promise.resolve()
                    },
                    validateFile: () => {
                        return Promise.resolve(true)
                    },
                    uploadFile: (context, event) => {
                        originalFileChangeHandler(event.payload)
                        return Promise.resolve(true)
                    },
                    canHandleMoreFiles: (context) => {
                        if (!context.maxFiles || !context.files.value || context.maxFiles > context.files.value.length) {
                          return Promise.resolve()
                        }

                        return Promise.reject()
                    }
                }
            })
        );

    const upload = ref(null)
    let dropTarget = null
    let inputLabel = null

    function handleDragEnter() {
        send('drag')
    }

    function handleDragLeave(evt) {
        const fromElementIndex = evt.path.indexOf(evt.fromElement)
        if (fromElementIndex === -1 || (evt.path.slice(0,1).pop() !== dropTarget && evt.path.indexOf(dropTarget) >= fromElementIndex)) {
            return
        }

        send('cancel')
    }

    function blockFileWindowOpen(evt) {
        if (!state.value.can('click')) {
            evt.preventDefault()
        }
    }

    onMounted(() => {
        dropTarget = upload.value?.$el.getElementsByClassName(upload.value.draggableClasses[0])?.[0]
        console.log(dropTarget)
        dropTarget.addEventListener('dragenter', handleDragEnter)
        dropTarget.addEventListener('dragleave', handleDragLeave)

        inputLabel = upload.value?.$el
        inputLabel.addEventListener('click', blockFileWindowOpen)

        originalFileChangeHandler = upload.value.onFileChange
        upload.value.onFileChange = (event) => {
            if (!state.value.can('drop')) {
                return
            }

            send('drop', { payload: event })
        }
    })


    return {
      state,
      send,
      upload,
      files
    };
  }
}
</script>

<style lang="scss">

$grey-light: #cccccc;
$radius-large: 8px;
$radius-rounded: 4px;
.upload {
    position: relative;
    display: inline-flex;
    input[type="file"] {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        outline: none;
        cursor: pointer;
        z-index: -1;
    }
    .upload-draggable {
        cursor: pointer;
        padding: 0.25em;
        border: 1px dashed $grey-light;
        border-radius: $radius-large;
        &.is-disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        &.is-loading {
            position: relative;
            pointer-events: none;
            opacity: 0.5;
            &:after {
                // @include loader;
                top: 0;
                left: calc(50% - 1.5em);
                width: 3em;
                height: 3em;
                border-width: 0.25em;
            }
        }

        &.is-expanded {
            width: 100%;
        }
    }
    &.is-expanded {
        width: 100%;
    }
    &.is-rounded {
        border-radius: $radius-rounded;

        .file-name {
            border-top-right-radius: $radius-rounded;
            border-bottom-right-radius: $radius-rounded;
        }
    }
}
// temporary IE 11 hack !!!
@media screen and (-ms-high-contrast: active), screen and (-ms-high-contrast: none) {
    .upload {
        input[type="file"] {
            z-index: auto;
        }
        .upload-draggable + input[type="file"] {
            z-index: -1;
        }
    }
}

</style>
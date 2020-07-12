<template>
  <div class="flex-column">
    <div class="controls">
      <label v-if="isAdmin" class="file-label">
        Change presentation
        <input type="file" ref="file" />
      </label>
      <button
        v-if="isAdmin"
        @click="() => changePage(pageNumber - 1)"
        class="change-page-button"
      >
        -
      </button>
      <span style="margin-right: 4px" v-if="!isAdmin"
        >Slide number:</span
      >
      <input
        @change="(e) => changePage(e.target.value)"
        :value="pageNumber"
        v-if="isAdmin"
        class="change-page-input"
      />
      <span v-else>{{ pageNumber }}</span>
      <button
        v-if="isAdmin"
        @click="() => changePage(pageNumber + 1)"
        class="change-page-button"
      >
        +
      </button>
    </div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import SocketIOFileUpload from 'socketio-file-upload';
import { useRoute, useRouter } from 'vue-router';
import useSocketEvent from '../compositions/socketEvent';
import {
  queueRenderPage,
  setPdfSource,
  getPdf,
} from '../compositions/renderPdf';

export default {
  name: 'App',
  props: {
    socket: Object,
  },
  setup(props, { emit }) {
    const route = useRoute();
    const router = useRouter();
    const canvas = ref(null);
    const file = ref(null);
    const pageNumber = ref(null);
    const isAdmin = ref(false);
    if (route.query.admin === 'true') {
      isAdmin.value = true;
    }

    function changePageHandle(requestedPage) {
      const newPageNumber = Number(requestedPage);
      const { numPages } = getPdf();
      if (newPageNumber < 1 || newPageNumber > numPages) {
        return;
      }
      pageNumber.value = newPageNumber;
    }

    function changePresentationHandle(presentationPath) {
      const password = sessionStorage.getItem(
        'roomPassword',
      );
      fetch(`${presentationPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
        }),
      })
        .then((response) => response.arrayBuffer())
        .then(async (arrayBuffer) => {
          const source = new Uint8Array(arrayBuffer);
          await setPdfSource(source);
          pageNumber.value = 1;
        })
        .catch((error) => emit('error', error));
    }
    function joinErrorHandle() {
      router.go(-1);
    }
    onMounted(() => {
      // Try to rejoin
      const password = sessionStorage.getItem(
        'roomPassword',
      );
      props.socket.emit('join', {
        name: route.params.roomId,
        password,
      });
      if (file.value) {
        const uploader = new SocketIOFileUpload(
          props.socket,
        );
        uploader.listenOnInput(file.value);
      }
    });
    function changePage(newPageNumber) {
      props.socket.emit('changePage', newPageNumber);
    }
    watch(pageNumber, () => {
      queueRenderPage(pageNumber.value, canvas.value);
    });
    return {
      isAdmin,
      changePage,
      pageNumber,
      file,
      canvas,
      ...useSocketEvent(
        props.socket,
        'changePage',
        changePageHandle,
      ),
      ...useSocketEvent(
        props.socket,
        'changePresentation',
        changePresentationHandle,
      ),
      ...useSocketEvent(
        props.socket,
        'join/error',
        joinErrorHandle,
      ),
    };
  },
};
</script>
<style scoped>
canvas {
  max-width: 100%;
  max-height: 80vh;
  box-shadow: 0px 12px 20px rgba(104, 104, 104, 0.14),
    0px 6px 12px rgba(104, 104, 104, 0.12),
    0px 2px 6px rgba(104, 104, 104, 0.13),
    0px 1px 4px rgba(104, 104, 104, 0.2);
}
.controls {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}
.change-page-input {
  width: 30px;
  height: 30px;
  margin: 0;
  text-align: center;
  text-indent: 0;
}
.change-page-button {
  min-width: auto;
  margin: 0 8px;
  padding: 6px 10px;
}
.file-label {
  padding: 10px 24px;
  background-color: #1c51a0;
  color: #fff;
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  text-align: center;
}
.file-label input {
  display: none;
}
.flex-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>

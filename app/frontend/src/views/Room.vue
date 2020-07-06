<template>
  <div class="flex-column">
    <label
      >Prezentacja
      <input type="file" ref="file" />
    </label>
    <button @click="() => changePage(pageNumber - 1)">-</button>
    <button @click="() => changePage(pageNumber + 1)">+</button>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import SocketIOFileUpload from 'socketio-file-upload';
import pdfjs from 'pdfjs-dist/webpack';

export default {
  name: 'App',
  props: {
    socket: Object,
  },
  data() {
    return {
      roomPassword: 'a',
      pdf: null,
      pageNumber: 0,
    };
  },
  mounted() {
    const uploader = new SocketIOFileUpload(this.socket);
    uploader.listenOnInput(this.$refs.file);
    this.socket.off('changePage');
    this.socket.on('changePage', (pageNumber) => {
      this.pageNumber = pageNumber;
      console.log(pageNumber);
    });
    this.socket.off('changePresentation');
    this.socket.on('changePresentation', (arg) => {
      fetch(`http://localhost:8080${arg}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: this.roomPassword,
        }),
      })
        .then((response) => response.arrayBuffer())
        .then(async (arrayBuffer) => {
          const source = new Uint8Array(arrayBuffer);
          this.pdf = await pdfjs.getDocument({ data: source }).promise;
          this.pageNumber = 1;
        });
    });
  },
  watch: {
    async pageNumber() {
      console.log(this.pageNumber);
      const page = await this.pdf.getPage(this.pageNumber);
      const scale = 1.5;
      const viewport = page.getViewport({ scale });

      // Prepare canvas using PDF page dimensions
      const { canvas } = this.$refs;
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page into canvas context
      const renderContext = {
        canvasContext: context,
        viewport,
      };

      page.render(renderContext);
    },
  },
  methods: {
    changePage(pageNumber) {
      this.socket.emit('changePage', pageNumber);
    },
  },
};
</script>
<style scoped>
.flex-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.flex-column > * {
  margin: 6px 0;
}
</style>

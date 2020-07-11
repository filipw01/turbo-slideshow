import pdfjs from 'pdfjs-dist/webpack';

let pdf = null;
let pageRendering = false;
let pageNumPending = null;

export async function setPdfSource(source) {
  pdf = await pdfjs.getDocument({
    data: source,
  }).promise;
}

export function getPdf() {
  return pdf;
}

export async function renderPage(num, canvasArgument) {
  const canvas = canvasArgument;
  pageRendering = true;
  const page = await pdf.getPage(num);
  const scale = 1.5;
  const viewport = page.getViewport({ scale });

  const context = canvas.getContext('2d');

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  const renderContext = {
    canvasContext: context,
    viewport,
  };

  const renderTask = page.render(renderContext);

  renderTask.promise.then(() => {
    pageRendering = false;
    if (pageNumPending !== null) {
      renderPage(pageNumPending, canvasArgument);
      pageNumPending = null;
    }
  });

  return canvas;
}

export function queueRenderPage(num, canvas) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num, canvas);
  }
}

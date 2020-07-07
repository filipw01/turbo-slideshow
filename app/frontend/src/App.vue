<template>
  <div>
    <div class="large-stain">
      <stain size="large" />
    </div>
    <div class="small-stain">
      <stain size="small" />
    </div>
    <div class="medium-stain">
      <stain size="medium" />
      <router-link to="/">
        <h1
          style="font-family: 'Rock Salt', cursive; color: #fff; position: absolute;
          top: 20px; left:20px"
        >Turbo SlideShow</h1>
      </router-link>
    </div>
    <div style="display:flex; justify-content:center; align-items: center; height: 100vh">
      <div class="content-box">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import Stain from './components/Stain.vue';

export default {
  name: 'App',
  components: {
    Stain,
  },
};
</script>
<style scoped>
a {
  text-decoration: none;
}
.small-stain,
.medium-stain,
.large-stain {
  position: absolute;
  z-index: -1;
}
.medium-stain {
  top: 0;
  left: 0;
}
.small-stain {
  top: 50%;
  left: 50%;
  transform: translate(-125%, -90%);
}
.large-stain {
  top: 0;
  bottom: 0;
  right: 0;
  overflow: hidden;
}
.content-box {
  max-width: 600px;
  width: 100%;
  background-color: white;
  padding: 48px;
  border-radius: 12px;
  box-shadow: 0px 12px 20px rgba(104, 104, 104, 0.14),
    0px 6px 12px rgba(104, 104, 104, 0.12),
    0px 2px 6px rgba(104, 104, 104, 0.13), 0px 1px 4px rgba(104, 104, 104, 0.2);
}
</style>
<style>
body {
  margin: 0;
}
input {
  display: block;
  height: 50px;
  border: 1px solid #d6d6d6;
  border-radius: 12px;
}
label {
  color: #adadad;
  font-size: 16px;
  line-height: 19px;
}
</style>

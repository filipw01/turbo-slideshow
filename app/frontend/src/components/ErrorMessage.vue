<template>
  <div class="message">
    <span style="vertical-align: middle">{{
      message
    }}</span>
    <button
      class="dismiss-button"
      aria-label="dismiss error"
      @click="$emit('dismiss-error')"
    ></button>
  </div>
</template>

<script>
export default {
  name: 'ErrorMessage',
  props: {
    message: String,
  },
};
</script>

<style>
.message {
  position: absolute;
  top: 48px;
  right: 48px;
  padding: 18px 24px;
  border-radius: 12px;
  color: #fff;
  background-color: #ca2f2f;
}
.dismiss-button {
  position: relative;
  margin-left: 4px;
  padding: 12px;
  min-width: auto;
  vertical-align: middle;
  background-color: unset;
  box-shadow: none;
}
.dismiss-button::before,
.dismiss-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 2px;
  background-color: #fff;
}
.dismiss-button::before {
  transform: translate(-50%, -50%) rotate(135deg);
}
.dismiss-button::after {
  transform: translate(-50%, -50%) rotate(45deg);
}
</style>

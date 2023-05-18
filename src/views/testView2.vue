<template>
  <div style="position: fixed;right:500px" @contextmenu="showMenu">activator</div>
  <context-menu :providedFunctionsProp="[{functionName:'test',functionLabel:'Hier klicken für Test'}]"></context-menu>
</template>

<script>

import ContextMenu from "@/components/ContextMenu.vue";

export default {
  name: "TestView2",
  components: {ContextMenu},
  props: ['name'],
  data() {
    return {};
  },
  provide() {
    return{
      test: this.test
    }
  },
  methods: {
    test() {
      console.log("success")
    },
    showMenu(e) {
      e.preventDefault();
      const contextMenu = document.querySelector(".wrapper")
      let x = e.clientX
      let y = e.clientY
      contextMenu.style.left = `${x}px`;
      contextMenu.style.top = `${y}px`;
      contextMenu.style.visibility = "visible";
      document.addEventListener("click", () => contextMenu.style.visibility = "hidden");
    }
  }
}

</script>

<style scoped>
.wrapper {
  visibility: hidden;
  position: absolute;
  width: 280px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.1);
}

.wrapper .menu {
  padding: 10px 12px;
}

.content .item {
  list-style: none;
  height: 20px !important;
  display: flex;
  width: 100%;
  cursor: pointer;
  align-items: center;
  border-radius: 5px;
  margin-bottom: 2px;
  padding: 0 5px 0 10px;
  font-size: 0.8rem;
}

.content .item:hover {
  background: #f2f2f2;
}

.content .item span {
  margin-left: 8px;
  font-size: 19px;
}
</style>

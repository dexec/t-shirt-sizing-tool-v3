<template>
  <div class="wrapper">
    <div class="content">
      <div class="menu">
        <div v-for="providedFunction of this.providedFunctions" :key="providedFunctions.indexOf(providedFunction)"
             @click="providedFunction.function">
          <span class="item" v-if="providedFunction.functionName==='movePaketUp'"><v-icon
              size="x-small">mdi-arrow-up</v-icon></span>
          <span class="item" v-else-if="providedFunction.functionName==='movePaketDown'"><v-icon
              size="x-small">mdi-arrow-down</v-icon></span>
          <span class="item" v-else-if="providedFunction.functionName==='movePaketLeftUp'"><v-icon
              size="x-small">mdi-arrow-top-left</v-icon></span>
          <span class="item" v-else-if="providedFunction.functionName==='movePaketLeftDown'"><v-icon
              size="x-small">mdi-arrow-bottom-left</v-icon></span>
          <span class="item" v-else-if="providedFunction.functionName==='movePaketRightUp'"><v-icon size="x-small">mdi-arrow-top-right</v-icon></span>
          <span class="item" v-else-if="providedFunction.functionName==='movePaketRightDown'"><v-icon
              size="x-small">mdi-arrow-bottom-right</v-icon></span>
          <span v-else class="item">{{ providedFunction.functionLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {inject} from "vue";

export default {
  props: {
    providedFunctionsProp: Array
  },
  setup(props) {
    const providedFunctions = []
    for (let providedFunctionProp of props.providedFunctionsProp) {
      const providedFunction = inject(providedFunctionProp.functionName);
      if (typeof providedFunction === 'function') providedFunctions.push({
        functionLabel: providedFunctionProp.functionLabel,
        functionName: providedFunctionProp.functionName,
        function: providedFunction
      })
    }
    return {providedFunctions}
  },
  methods: {}
}
</script>

<style scoped>
.wrapper {
  display: none;
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
  height: 20px;
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

</style>

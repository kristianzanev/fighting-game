<template>
      <div class='bar-wrap' v-bind:class='position.toLowerCase()' v-bind:style ="cssBar">
        <span> {{healthStatus.name}} - {{healthStatus.health}} hp</span>
        <div class='health-bar' v-bind:style ="setSize"/>
         </div>
</template>

<script>
export default {
  name: 'HealthBar',
  props: {
    healthStatus: {
      type: Object,
      default: function () {
        return {
          health: 100,
          name: 'noName'
        }
      }
    },
    position: {
      type: String,
      default: 'left'
    }
  },
  computed: {
    setSize () {
      return `
      width: calc(${this.healthStatus.health}% - (2 * ${this.cssBar.padding}))
      height: calc(100% - (2 * ${this.cssBar.padding}))
              `
    }
  },
  data () {
    return {
      cssBar: {
        padding: '5px'
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
// $health-barPadding: 5px;
.left {
    left: 0;
    .health-bar {
      background-image: linear-gradient(160deg, #ff0000, #ff7600);
      box-shadow:  0 0 0 0 #ff0000, 0.1rem 0.1rem 15px #ff76008c;
      border: solid red 1.2px;
    }
  }
.right {
    right: 0;
    .health-bar {
      background-image: linear-gradient(160deg, #6200ff, #0095ff);
      box-shadow: 0 0 0 0 #6200ff, 0.1rem 0.1rem 15px #6200ff73;
      border: solid #6200ff 1.2px;
    }
  }
.bar-wrap {
  width: 30%;
  height: 5%;
  background: #cbcbcb;
  position: absolute;
  border-bottom-right-radius: 20px;
  border-bottom-left-radius: 20px;
  // padding: $health-barPadding;
  .health-bar {
    // height: calc(100% - (2 *#{$health-barPadding}));
    border-radius: 100px;
    position: absolute;
    transition: 400ms;
    transition-timing-function: ease-in-out;
  }
}
</style>

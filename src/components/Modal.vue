<template>
      <div class='modal-wrapper'>
        <!-- <label for="name">{{texts.name}}:</label>
        <input type="text" id="name" name="name" required minlength="4" maxlength="8" size="10" v-model="input.name">
        <label for="name">{{texts.room}}:</label>
        <input type="text" id="name" name="name" required minlength="4" maxlength="8" size="10" v-model="input.room">
        <h2>Submit</h2>
        <input type="submit" value="Submit" v-on:click="submit" /> -->
        <form
        class='form-input'
        @submit="checkForm"
        >
        <p v-if="errors.length">
            <b>Please correct the following error(s):</b>
            <ul class='unordered-list'>
            <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
        </p>

        <ul class='unordered-list'>
            <li>
            <label for="name">{{texts.name}}</label>
            <input v-model="input.name" type="text" >
            </li>
            <li>
            <label for="room">{{texts.room}}</label>
            <input v-model="input.room" type="text" >
            </li>
            <li>
            <input type="submit">
            </li>
        </ul>
        </form>
         </div>
</template>

<script>
export default {
  name: 'HealthBar',
  methods: {
    // submit: function (e) {
    //   console.log(e.srcElement.validity.valid, this.input.name, this.input.room)

    //   this.input.name = ''
    //   this.input.room = ''

    //   e.preventDefault()
    // }
    checkForm: function (e) {
      e.preventDefault()

      this.errors = []
      if (!this.isCorrect(this.input.name)) {
        this.errors.push('Name should be from 4 to 8 characters')
      }
      if (!this.isCorrect(this.input.room)) {
        this.errors.push('Room should be from 4 to 8 characters')
      }

      if (this.errors.length) return
      this.$emit('formValidated', { name: this.input.name, room: this.input.room })
    },
    isCorrect (input) {
      if (!input) return false

      const length = input.length
      if (length > this.rules.charsLength.max || length < this.rules.charsLength.min) {
        return false
      } else return true
    }
  },
  data () {
    return {
      texts: {
        name: `Enter Name (4 to 8 characters)`,
        room: 'Enter Room (4 to 8 characters)'
      },
      input: {
        name: '',
        room: ''
      },
      errors: [],
      rules: {
        charsLength: {
          min: 4,
          max: 8
        }
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
// $health-barPadding: 5px;
.modal-wrapper {
  width: 100%;
  height: 100%;
  background: #000000ad;
  position: absolute;
  border-bottom-right-radius: 20px;
  border-bottom-left-radius: 20px;
  .form-input {
      padding: 5%;
      background: whitesmoke;
  }
}
.unordered-list {
    list-style-type:none;
    display: flex;
    flex-direction: column;
    align-items: center;
    li {
        width: 50%;
        padding: 2%;
        > * {
           padding:  2%;
        }
    }
}
</style>

<template>
    <div class="button-container">
      <button v-for="(button, index) in buttons" :key="index" class="availability-button">
        Availabilities
      </button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        // Array to create multiple buttons
        buttons: Array(4).fill("Availabilities"),
      };
    },
  };
  </script>
  
  <style scoped>
  .button-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start; /* Align to the left */
    gap: 10px; /* Space between buttons */
  }
  
  .availability-button {
    background-color: #d4a617; /* Gold color */
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
  }
  
  .availability-button:hover {
    background-color: #b39114; /* Darker gold on hover */
  }
  </style>
  
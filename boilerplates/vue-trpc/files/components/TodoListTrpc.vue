<template>
  <ul>
    <li v-for="item in todoItems" :key="item.text">
      {{ item.text }}
    </li>
    <li>
      <form @submit.prevent="submitDraft()">
        <input v-model="draft" type="text" />{{ " " }}
        <button type="submit">Add to-do</button>
      </form>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { trpc } from "@batijs/trpc/trpc/client";
import { ref, useAttrs, type Ref } from "vue";

type TodoItem = { text: string };

const attrs = useAttrs();

const todoItems = ref(attrs["todo-items-initial"]) as Ref<TodoItem[]>;
const draft = ref("");

const submitDraft = async () => {
  const result = await trpc.onNewTodo.mutate(draft.value);
  draft.value = "";
  todoItems.value = result.todoItems;
};
</script>

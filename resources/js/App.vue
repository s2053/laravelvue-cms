<template>
    <Layout>
      <router-view></router-view>
    </Layout>
  </template>

  <script>
  import Layout from './layouts/DashboardLayout.vue';

  export default {
    components: { Layout }
  };
  </script>

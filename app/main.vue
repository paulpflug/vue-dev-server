// out: .
<template lang="pug">
h4 Available routes:
ul.dev-server-nav
  li(v-for="route in availableRoutes" v-link="route.fullPath") {{route.fullPath}}
</template>

<script lang="coffee">
module.exports =
  computed:
    availableRoutes: -> @$parent.availableRoutes
</script>
<style lang="stylus">
ul.dev-server-nav
  list-style-type: none
.dev-server-nav > li
  cursor pointer
.dev-server-nav > li:hover
  color #008cff
</style>

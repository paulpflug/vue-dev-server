// out: .
<template lang="pug">
.routes
  h4 Available routes:
  ul.dev-server-nav
    router-link(:to="route.path" tag="li" v-for="route in availableRoutes")
      a {{route.path}}
</template>

<script lang="coffee">
module.exports =
  computed:
    availableRoutes: -> @$parent.availableRoutes
  mounted: -> 
    if @availableRoutes.length == 1
      @$router.push @availableRoutes[0]
</script>

<style lang="stylus">
ul.dev-server-nav
  list-style-type: none
.dev-server-nav > li
  cursor pointer
.dev-server-nav > li:hover
  color #008cff
</style>

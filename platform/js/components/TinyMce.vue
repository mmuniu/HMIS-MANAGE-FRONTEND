<template>
    <div id="app">
        <editor
                api-key="ey11bm7sj7q4whqw7qptr2f8g5v5kgz667je1np4tevo4sl8"
        />
    </div>
</template>

<script>
    import Editor from '@tinymce/tinymce-vue'

    export default {
        name: 'app',
        components: {
            'editor': Editor
        }
    }
</script>

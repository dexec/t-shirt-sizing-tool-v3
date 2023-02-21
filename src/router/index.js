// Composables
import {createRouter, createWebHashHistory} from 'vue-router'
import VergleichView from "@/views/VergleichView.vue";
import BucketUebersichtView from "@/views/BucketUebersichtView.vue";
import PaketUebersichtView from "@/views/PaketUebersichtView.vue";
import ProjektkalkulationView from "@/views/ProjektkalkulationView.vue";
import ProjektUebersichtView from "@/views/ProjektUebersichtView.vue";
import testView from "@/views/testView.vue";
import testView2 from "@/views/testView2.vue";

const router = createRouter({
    history: createWebHashHistory(process.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/projekt'
        },
        {
            path: '/projekt',
            name: 'projekt',
            component: ProjektUebersichtView,
        },
        {
            path: '/vergleich',
            name: 'vergleich',
            component: VergleichView
        },
        {
            path: '/buckets',
            name: 'buckets',
            component: BucketUebersichtView
        },
        {
            path: '/pakete',
            name: 'pakete',
            component: PaketUebersichtView
        },
        {
            path: '/kalkulation',
            name: 'kalkulation',
            component: ProjektkalkulationView
        },
        {
            path: '/test',
            name: 'test',
            component: testView
        },
        {
            path: '/test2',
            name: 'test2',
            component: testView2
        },
    ]
})

export default router;

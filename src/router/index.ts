// Composables
import {createRouter, createWebHashHistory} from 'vue-router'
import VergleichView from "@/views/VergleichView.vue";
import BucketUebersichtView from "@/views/StatistikenView.vue";
import PaketUebersichtView from "@/views/PaketUebersichtView.vue";
import ProjektkalkulationView from "@/views/ProjektaufschlaegeView.vue";
import ProjektUebersichtView from "@/views/ProjektUebersichtView.vue";
import testView from "@/views/testView.vue";
import {useProjektStore} from "@/stores/projekt";
import {ref} from "vue";

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            alias: '/projekt',
            name: 'projekt',
            component: ProjektUebersichtView
        }/*,
        {
            path: '/projekt',
            name: 'projekt',
            component: ProjektUebersichtView,
        },*/,
        {
            path: '/vergleich',
            name: 'vergleich',
            component: VergleichView,
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
        }
    ]
})
const geladen = ref(false)
router.beforeEach((to) => {
    if (to.name == 'projekt') geladen.value = true
    if (!geladen.value && to.name != 'projekt' && to.name != '/') {

        geladen.value = true;
        return {name: 'projekt'}
    }
    if (to.path === '/vergleich') {
        const projectStore = useProjektStore();
        if (!projectStore.bucketmodus) return false
    }
})

export default router;

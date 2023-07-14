// Composables
import {createRouter, createWebHashHistory} from 'vue-router'
import VergleichView from "@/views/VergleichView.vue";
import BucketUebersichtView from "@/views/BucketUebersichtView.vue";
import PaketUebersichtView from "@/views/PaketUebersichtView.vue";
import ProjektkalkulationView from "@/views/ProjektkalkulationView.vue";
import ProjektUebersichtView from "@/views/ProjektUebersichtView.vue";
import testView from "@/views/testView.vue";
import testView2 from "@/views/testView2.vue";
import {useProjektStore} from "@/stores/projekt";
import LandingPageView from "@/views/LandingPageView.vue";
import {defineComponent, ref} from "vue";
import {useLandingpageStore} from "@/stores/landingpage";

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'landingpage',
            component: LandingPageView
        },
        {
            path: '/projekt',
            name: 'projekt',
            component: ProjektUebersichtView,
        },
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
        },
        {
            path: '/test2',
            name: 'test2',
            component: testView2,
            props: true
        },
    ]
})
router.beforeEach((to, from) => {
    const landingPageStore = useLandingpageStore();
    if (!landingPageStore.geladen && to.name!='landingpage') {
        return {name: 'landingpage'}
    }
    if (to.path === '/vergleich') {
        const projectStore = useProjektStore();
        if(!projectStore.bucketmodus) return false
    }
})

export default router;

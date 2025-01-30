// Composables
import {createRouter, createWebHashHistory} from 'vue-router'
import VergleichView from "@/views/VergleichView.vue";
import PaketUebersichtView from "@/views/PaketUebersichtView.vue";
import ProjektaufschlaegeView from "@/views/EintraegeView.vue";
import ProjektUebersichtView from "@/views/ProjektUebersichtView.vue";
import testView from "@/views/testView.vue";
import {useKonfigContainer} from "@/stores/konfigContainer";
import {ref} from "vue";
import StatistikenView from "@/views/StatistikenView.vue";

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            alias: '/projektKonfig',
            name: 'projekt',
            component: ProjektUebersichtView
        },
        {
            path: '/vergleich',
            name: 'vergleich',
            component: VergleichView,
        },
        {
            path: '/statistikenService',
            name: 'statistiken',
            component: StatistikenView
        },
        {
            path: '/pakete/:id?',
            name: 'pakete',
            component: PaketUebersichtView
        },
        {
            path: '/aufschlaege',
            name: 'aufschlaege',
            component: ProjektaufschlaegeView
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
        const konfigContainer = useKonfigContainer();
        if (!konfigContainer.bucketmodus) return false
    }
})

export default router;

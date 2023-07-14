import {defineStore} from "pinia";
import {ref} from "vue";
import {ImportProject} from "@/components/ImportProject";

export const useProjektStore = defineStore('projekt', () => {
    const importProject = ImportProject.getInstance()
    const projectData = importProject.getProjectData();
    const projektname = ref<string>(projectData.projektname);
    const projektbeschreibung = ref<string>(projectData.projektbeschreibung);
    const bucketmodus = ref<boolean>(projectData.bucketmodus);
    return {
        projektname,
        projektbeschreibung,
        bucketmodus
    }
})
export interface ReflectionQuestionProps {
    title: string;
    subTitle: string;
    label: string;
    htmlFor: string;
    textareaPlaceholder: string;
}

export const REFLECTION_QUESTIONS: Array<ReflectionQuestionProps> = [
    {
        title: "STAP 1",
        subTitle: "Kies 1 kaart die je het meest raakt",
        label: "Welke kaart raakt mij het meest of herken ik het sterkst in eerdere situaties of mijn  dagelijks leven?",
        htmlFor: "stap-2",
        textareaPlaceholder: "Leg hier de kaart neer"
    },
    {
        title: "STAP 2",
        subTitle: "Waarom raakt juist deze kaart je?",
        label: "Waarom raakt deze kaart mij? In welke situaties herken ik dit?",
        htmlFor: "stap-2",
        textareaPlaceholder: "Plak jouw sticky notes"
    },
    {
        title: "STAP 3",
        subTitle: "De coachingsvraag",
        label: "Wat zou ik willen begrijpen, veranderen of onderzoeken rondom dit gedrag?",
        htmlFor: "stap-2",
        textareaPlaceholder: "Plak jouw sticky note"
    },
];
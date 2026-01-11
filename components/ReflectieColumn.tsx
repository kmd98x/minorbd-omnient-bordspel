interface ReflectieColumnProps {
    title: string;
    firstQuestion: string;
    label: string;
    htmlFor: string;
    value: string;
    placeholder: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    disabled?: boolean;
}

export default function ReflectieColumn({title, firstQuestion, placeholder, label, htmlFor, value, onChange, disabled = false}: ReflectieColumnProps) {
    return (
        <div className="flex flex-1 flex-col gap-7">
            <h2 className="text-5xl font-black tracking-[3] text-center">{title}</h2>
            <p className="font-bold text-center text-2xl">{firstQuestion}</p>

            <div className="bg-white rounded-lg flex flex-col justify-between gap-10 items-center p-7 h-full w-full">
                <label htmlFor="vraag-stap-1" className="font-bold text-justify max-w-[170px] w-full">{label}</label>
                <textarea 
                    onChange={onChange} 
                    value={value}
                    placeholder={placeholder} 
                    name={htmlFor} 
                    id={htmlFor}
                    disabled={disabled}
                    className={`w-full h-full rounded-md bg-button/30 p-5 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}></textarea>
            </div>
        </div>
    )
}

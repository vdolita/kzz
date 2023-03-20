type Props = {
    title: string;
    children?: React.ReactNode;
};

export default function FeatureBox({ title, children }: Props) {
    return (
        <div className="flex flex-col gap-y-2 bg-stone-50 p-2">
            <p className="text-base text-center">{title}</p>
            {children}
        </div>
    );
}

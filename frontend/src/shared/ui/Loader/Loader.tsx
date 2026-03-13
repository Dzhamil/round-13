import { loaderStyles } from "../styles/Loader.styles";

export type LoaderProps = {
    text?: string;
};

export function Loader(props: LoaderProps) {
    const { text = "Загрузка..." } = props;

    return (
        <div style={loaderStyles.root}>
            <div style={loaderStyles.text}>{text}</div>
        </div>
    );
}

export default Loader;

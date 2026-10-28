import { prepareContent } from "@/utils/postContent";
import styles from "./PostContent.module.css";

// El texto de un artículo. WordPress lo entrega ya limpio (wp_kses_post) y
// sin estilos: los de aquí se apoyan en las clases que genera su editor
// (wp-block-*, el bloque de preguntas de Yoast…) y en dos propias del blog:
// .resumen-ia (la caja "En este artículo") y .callout (la frase destacada).
export default function PostContent({ html }: { html: string }) {
    return (
        <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: prepareContent(html) }}
        />
    );
}

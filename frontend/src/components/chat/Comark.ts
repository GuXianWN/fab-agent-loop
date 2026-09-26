import { defineMarkdownComponent } from '@comark/vue';
import shiki from '@comark/vue/plugins/shiki';
import c from '@shikijs/langs/c';
import cpp from '@shikijs/langs/cpp';
import css from '@shikijs/langs/css';
import diff from '@shikijs/langs/diff';
import dockerfile from '@shikijs/langs/dockerfile';
import go from '@shikijs/langs/go';
import graphql from '@shikijs/langs/graphql';
import html from '@shikijs/langs/html';
import java from '@shikijs/langs/java';
import kotlin from '@shikijs/langs/kotlin';
import php from '@shikijs/langs/php';
import python from '@shikijs/langs/python';
import ruby from '@shikijs/langs/ruby';
import rust from '@shikijs/langs/rust';
import sql from '@shikijs/langs/sql';
import swift from '@shikijs/langs/swift';
import toml from '@shikijs/langs/toml';
import xml from '@shikijs/langs/xml';
import ChatCodeBlock from './ChatCodeBlock.vue';

export default defineMarkdownComponent({
  name: 'ChatComark',
  plugins: [shiki({ languages: [html, css, python, sql, go, rust, java, c, cpp, ruby, php, swift, kotlin, diff, dockerfile, xml, toml, graphql] })],
  components: { ProsePre: ChatCodeBlock },
  class: '*:first:mt-0 *:last:mb-0',
});

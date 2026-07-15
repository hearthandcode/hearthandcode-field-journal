import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: { site: URL | undefined }) {
  const posts = (await getCollection('posts'))
    .filter((post) => post.data.status === 'published')
    .sort((a, b) => {
      const aDate = new Date(a.data.published_date ?? a.data.date).getTime();
      const bDate = new Date(b.data.published_date ?? b.data.date).getTime();
      const dateDifference = bDate - aDate;
      if (dateDifference !== 0) return dateDifference;

      const orderDifference = (b.data.published_order ?? 0) - (a.data.published_order ?? 0);
      if (orderDifference !== 0) return orderDifference;

      return b.id.localeCompare(a.id);
    });

  return rss({
    title: 'Hearth & Code · Field Journal',
    description:
      'A public research desk for selected notes on Exocore, applied AI, and the craft of giving complex work a clearer next step.',
    site: context.site ?? new URL('https://blog.hearthandcode.dev'),
    customData: '<language>en-us</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: new Date(`${post.data.published_date ?? post.data.date}T00:00:00.000Z`),
      link: `/posts/${post.id}/`,
      categories: post.data.tags,
    })),
  });
}

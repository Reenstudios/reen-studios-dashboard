-- Reën Studios Dashboard schema

create table artworks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  medium text,
  dimensions text,
  status text default 'Available', -- Available, Sold, Reserved
  is_christian boolean default false,
  bible_verse text,
  tags text[],
  image_url text,
  extra_images text[],
  notes text,
  created_at timestamp with time zone default now()
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid references artworks(id) on delete set null,
  platform text not null, -- Instagram, Facebook, Pinterest, Email
  post_type text default 'Feed', -- Feed, Story, Carousel, Reel
  caption text,
  status text default 'Idea', -- Idea, Draft, Scheduled, Published
  scheduled_for timestamp with time zone,
  published_at timestamp with time zone,
  ig_post_id text, -- filled in once auto-publishing is live
  insights jsonb, -- reach, saves, engagement once pulled from Meta API
  created_at timestamp with time zone default now()
);

create table content_ideas (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid references artworks(id) on delete set null,
  idea text not null,
  source text default 'AI', -- AI, Manual
  used boolean default false,
  created_at timestamp with time zone default now()
);

create index idx_posts_status on posts(status);
create index idx_posts_scheduled on posts(scheduled_for);
create index idx_artworks_status on artworks(status);

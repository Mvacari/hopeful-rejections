-- Ensure username column allows NULL (optional username)
alter table public.users alter column username drop not null;

-- Create function to handle new user creation
-- This trigger automatically creates a user profile entry when a new user signs up via Supabase Auth
-- Username defaults to the user's email address
create or replace function public.handle_new_user()
returns trigger
set search_path = ''
as $$
begin
  insert into public.users (id, username, created_at)
  values (new.id, new.email, new.created_at);
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger that fires after a new user is inserted into auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


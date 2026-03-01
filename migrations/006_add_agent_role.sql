-- Add agent role to the role enum
-- This migration expands the role system to support agents

ALTER TABLE public.users 
DROP CONSTRAINT users_role_check;

ALTER TABLE public.users
ADD CONSTRAINT users_role_check 
CHECK (role IN ('user', 'seller', 'admin', 'agent'));

-- Add comment for documentation
COMMENT ON COLUMN public.users.role IS 'User role: user (buyer), seller (property seller), agent (real estate agent), admin (platform administrator)';

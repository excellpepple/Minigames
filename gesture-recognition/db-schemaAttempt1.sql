CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cognito_sub UUID UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_admin BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'
);

-- User consent forms table
-- For if we need to store users giving consent to their landmark data being recorded.
CREATE TABLE user_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  consent_version TEXT NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  details JSONB DEFAULT '{}'
);

-- Games table
-- For saving and fetching user created games, references rulesets table to associate a game with its rules.
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  game_title TEXT NOT NULL,
  description TEXT,
  active_ruleset_id UUID references rulesets(id),
  visibility TEXT NOT NULL DEFAULT 'private',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Rulesets 
CREATE TABLE rulesets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  ruleset_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);



-- Gesture types data
-- We can somehow use this so the ML model can refernce them?
-- Idk but i know we need to store them in some fashion
CREATE TABLE gesture_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  gesture_data JSONB DEFAULT '{}'
);




-- Landmark streams
-- "Recordings" of the user landmark data. Stream data can be stored in the JSON file.
-- This will be the bulk of the database in size.

CREATE TABLE landmark_streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uploader_id UUID REFERENCES users(id),
  game_id UUID REFERENCES games(id),
  ruleset_id UUID REFERENCES rulesets(id),
  stream_blob JSONB, -- For storing the bulk data
  num_frames INTEGER,
  fps NUMERIC, 
  duration_seconds NUMERIC,
  size_bytes BIGINT, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed BOOLEAN DEFAULT FALSE, -- To be marked TRUE if the stream has been used to train ML models.
  processing_details JSONB DEFAULT '{}', -- We can use this to mark what type of processing was done on the stream.
  privacy TEXT DEFAULT 'private',
  metadata JSONB DEFAULT '{}' -- device info, handedness, coordinate system, vector normalization info
);


-- These indexes will allegedly speed up the queries on this table which will be helpful when training models.
CREATE INDEX idx_landmark_streams_game ON landmark_streams(game_id);
CREATE INDEX idx_landmark_streams_uploader ON landmark_streams(uploader_id);
CREATE INDEX idx_landmark_streams_createdat ON landmark_streams(created_at);



-- Annotations table
-- Annotations can be used to mark when in a stream something of use to our training occurs.
-- The process will be manual at first, marking where gestures begin and end, but could be done programatically.
CREATE TABLE annotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID REFERENCES landmark_streams(id) ON DELETE CASCADE,
  annotator_id UUID REFERENCES users(id),
  gesture_type_id UUID REFERENCES gesture_types(id),
  start_frame INTEGER NOT NULL,
  end_frame INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Creating an index for the annotations table, for the same reason as before.
CREATE INDEX idx_annotations_stream ON annotations(stream_id);

-- Datasets for grouping streams and annotations together
CREATE TABLE datasets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);
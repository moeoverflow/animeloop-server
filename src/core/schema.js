/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const autoIncrement = require('mongoose-auto-increment');

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

autoIncrement.initialize(mongoose.connection);

const SeriesSchema = new Schema({
  title: String,
  title_t_chinese: String,
  title_romaji: String,
  title_english: String,
  title_japanese: String,
  start_date_fuzzy: Number,
  description: String,
  genres: [String],
  total_episodes: Number,
  adult: Boolean,
  end_date_fuzzy: Number,
  hashtag: String,
  image_url_large: String,
  image_url_banner: String,
  anilist_updated_at: Date,
  updated_at: Date,
  type: String,
  anilist_id: { type: Number, unique: true },
});
SeriesSchema.plugin(findOrCreate);

const EpisodeSchema = new Schema({
  title: String,
  series: { type: ObjectId, ref: 'Series', require: true },
  no: String,
});
EpisodeSchema.plugin(findOrCreate);

const LoopSchema = new Schema({
  duration: Number,
  period: {
    begin: String,
    end: String,
  },
  frame: {
    begin: Number,
    end: Number,
  },
  episode: { type: ObjectId, ref: 'Episode', require: true },
  series: { type: ObjectId, ref: 'Series', require: true },
  r18: { type: Boolean, default: false },
  sourceFrom: String,
  uploadDate: { type: Date, require: true },
  likes: { type: Number, default: 0 },
});

const TagsSchema = new Schema({
  loopid: ObjectId,
  type: String,
  value: String,
  confidence: Number,
  source: String,
  lang: Number,
});

const UserSchema = new Schema({
  uid: { type: Number, require: true, unique: true },
  username: { type: String, require: true },
  email: { type: String, require: true },
  avatar: { type: String, require: false },
  password: { type: String, require: true },
  admin: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
});
UserSchema.plugin(autoIncrement.plugin, { model: 'User', field: 'uid' });

const UserTokenSchema = new Schema({
  tid: { type: Number, require: true, unique: true },
  name: { type: String, require: true },
  token: { type: String, require: true },
  userid: { type: Number, require: true },
});
UserTokenSchema.plugin(autoIncrement.plugin, { model: 'UserToken', filed: 'tid' });

const LoopCollectionSchema = new Schema({
  cid: { type: Number, require: true, unique: true },
  name: { type: String, require: true, unique: true },
  title: { type: String, require: true },
  description: { type: String, require: true },
  userid: { type: Number, require: true },
});
LoopCollectionSchema.plugin(autoIncrement.plugin, { model: 'LoopCollection', field: 'cid' });

const CollectionLoopSchema = new Schema({
  collectionid: { type: Number, require: true },
  loopid: { type: ObjectId, ref: 'Loop', require: true },
});

module.exports = {
  LoopSchema,
  EpisodeSchema,
  SeriesSchema,
  TagsSchema,
  UserSchema,
  UserTokenSchema,
  LoopCollectionSchema,
  CollectionLoopSchema,
};

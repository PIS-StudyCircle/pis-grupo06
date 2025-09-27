# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_09_27_173119) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "unaccent"

  create_table "courses", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "faculty_id"
    t.string "code"
    t.string "institute"
    t.index ["code"], name: "index_courses_on_code"
    t.index ["faculty_id"], name: "index_courses_on_faculty_id"
  end

  create_table "faculties", force: :cascade do |t|
    t.string "name", null: false
    t.bigint "university_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["university_id"], name: "index_faculties_on_university_id"
  end

  create_table "favorite_courses", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "course_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["course_id"], name: "index_favorite_courses_on_course_id"
    t.index ["user_id", "course_id"], name: "index_favorite_courses_on_user_id_and_course_id", unique: true
    t.index ["user_id"], name: "index_favorite_courses_on_user_id"
  end

  create_table "subject_tutorings", force: :cascade do |t|
    t.bigint "subject_id", null: false
    t.bigint "tutoring_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["subject_id", "tutoring_id"], name: "index_subject_tutorings_on_subject_id_and_tutoring_id", unique: true
    t.index ["subject_id"], name: "index_subject_tutorings_on_subject_id"
    t.index ["tutoring_id"], name: "index_subject_tutorings_on_tutoring_id"
  end

  create_table "subjects", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "course_id", null: false
    t.bigint "creator_id"
    t.date "due_date"
    t.index ["course_id", "name"], name: "index_subjects_on_course_id_and_name", unique: true
    t.index ["course_id"], name: "index_subjects_on_course_id"
    t.index ["creator_id"], name: "index_subjects_on_creator_id"
  end

  create_table "tutorings", force: :cascade do |t|
    t.datetime "scheduled_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "duration_mins", default: 60
    t.string "modality", null: false
    t.integer "capacity"
    t.bigint "created_by_id"
    t.bigint "tutor_id"
    t.integer "enrolled", default: 0, null: false
    t.bigint "course_id", null: false
    t.index ["course_id"], name: "index_tutorings_on_course_id"
    t.index ["created_by_id"], name: "index_tutorings_on_created_by_id"
    t.index ["tutor_id"], name: "index_tutorings_on_tutor_id"
  end

  create_table "universities", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_tutorings", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "tutoring_id", null: false
    t.integer "score"
    t.text "comment"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tutoring_id"], name: "index_user_tutorings_on_tutoring_id"
    t.index ["user_id", "tutoring_id"], name: "index_user_tutorings_on_user_id_and_tutoring_id", unique: true
    t.index ["user_id"], name: "index_user_tutorings_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "name", null: false
    t.string "last_name", null: false
    t.text "description"
    t.string "jti", null: false
    t.bigint "faculty_id"
    t.string "provider"
    t.string "uid"
    t.string "google_access_token"
    t.string "google_refresh_token"
    t.datetime "google_expires_at"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["faculty_id"], name: "index_users_on_faculty_id"
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["uid"], name: "index_users_on_uid"
  end

  add_foreign_key "courses", "faculties"
  add_foreign_key "faculties", "universities"
  add_foreign_key "favorite_courses", "courses"
  add_foreign_key "favorite_courses", "users"
  add_foreign_key "subject_tutorings", "subjects"
  add_foreign_key "subject_tutorings", "tutorings"
  add_foreign_key "subjects", "courses"
  add_foreign_key "subjects", "users", column: "creator_id", on_delete: :nullify
  add_foreign_key "tutorings", "courses"
  add_foreign_key "tutorings", "users", column: "created_by_id"
  add_foreign_key "tutorings", "users", column: "tutor_id"
  add_foreign_key "user_tutorings", "tutorings"
  add_foreign_key "user_tutorings", "users"
  add_foreign_key "users", "faculties"
end

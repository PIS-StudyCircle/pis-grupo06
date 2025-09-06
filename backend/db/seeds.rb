require 'json'

# Facultades y Universidad base (si todavía no tenés ninguna)
uni = University.find_or_create_by!(name: "Universidad de la República")
fing = Faculty.find_or_create_by!(name: "Facultad de Ingeniería", university: uni)

puts "Seeding courses from JSON..."

file_path = Rails.root.join('db', 'courses.json')
json_data = JSON.parse(File.read(file_path))

json_data.each do |entry|
  Course.create!(
    name: entry['nombre'],
    code: entry['codigo'],
    institute: entry['instituto'],
    faculty: fing,
  )
end

puts "Finished seeding courses. Total courses: #{Course.count}"

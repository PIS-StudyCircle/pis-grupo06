require 'rails_helper'

RSpec.describe User, type: :model do
  before do
    university = University.create!(name: "Universidad de Ejemplo")
    @faculty = Faculty.create!(name: "FING", university: university)
  end
  context "validaciones de Devise" do
    it "no permite emails duplicados" do
      User.create!(
        email: "test@example.com",
        password: "contrasena1",
        name: "Pedro",
        last_name: "García",
        faculty: @faculty
      )

      user_duplicado = User.new(
        email: "test@example.com",
        password: "contrasena2",
        name: "Juan Carlos",
        last_name: "Perez"
      )

      expect(user_duplicado.valid?).to eq(false)
      expect(user_duplicado.errors[:email]).to include("has already been taken")
    end

    it "requiere al menos 8 caracteres en la contraseña" do
      user = User.new(
        email: "ana@example.com",
        password: "123",
        name: "Pedro",
        last_name: "García",
        faculty: @faculty
      )

      expect(user.valid?).to eq(false)
      expect(user.errors[:password]).to include("is too short (minimum is 8 characters)")
    end

  end

  context "creación y modificación de usuario" do
    it "crea un usuario válido y permite modificar sus datos" do
      # Crear usuario
      user = User.create!(
        email: "juan@example.com",
        password: "password123",
        name: "Juan",
        last_name: "Pérez",
        description: "Estudiante de Ingeniería",
        faculty: @faculty
      )

      expect(user).to be_valid
      expect(user.name).to eq("Juan")

      # Modificar el nombre
      user.update!(name: "Juan Carlos")

      # Verificar el cambio
      expect(user.reload.name).to eq("Juan Carlos")
    end
  end
end

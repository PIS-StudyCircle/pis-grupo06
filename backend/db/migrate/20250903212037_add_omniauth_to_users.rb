class AddOmniauthToUsers < ActiveRecord::Migration[7.1] # o tu versión
  def change
    # Agregar columnas solo si no existen
    add_column :users, :provider, :string unless column_exists?(:users, :provider)
    add_column :users, :uid,      :string unless column_exists?(:users, :uid)
    # name ya existe en tu tabla, así que lo omitimos
    # add_column :users, :name, :string unless column_exists?(:users, :name)

    # Índice recomendado (único) sobre provider+uid
    unless index_exists?(:users, [:provider, :uid], unique: true)
      add_index :users, [:provider, :uid], unique: true
    end
  end
end

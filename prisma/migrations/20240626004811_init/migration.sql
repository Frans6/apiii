-- CreateTable
CREATE TABLE "pessoa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "pessoa_nome_key" ON "pessoa"("nome");
